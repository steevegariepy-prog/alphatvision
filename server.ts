import { isPlayStoreContext, purchaseWithGooglePlay } from './services/googleBilling';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// Safe path resolution for both ES Module (dev) and CommonJS (prod)
let currentDirname = "";
try {
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  currentDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. CORS & Security Headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    next();
  });

  // 2. PWA Manifest
  const manifest = {
    name: "AsphaltVision",
    short_name: "AsphaltVision",
    description: "Visualisez votre entrée de garage avec un scellant d'asphalte frais grâce à l'IA.",
    lang: "fr-CA",
    start_url: "/",
    id: "/",
    display: "fullscreen",
    background_color: "#18181b",
    theme_color: "#18181b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    screenshots: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", form_factor: "narrow" }
    ]
  };

  app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).json(manifest);
  });

  // 3. Asset Links pour Android (Indispensable pour le Play Store)
  app.get("/.well-known/assetlinks.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send([
      {
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
          "namespace": "android_app",
          "package_name": "com.asphaltvision.twa", // À ajuster selon votre package Android
          "sha256_cert_fingerprints": [
            "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"
          ]
        }
      }
    ]);
  });

  // 4. Fichiers statiques et Icônes
  app.use(express.static(path.join(currentDirname, "public")));

  // 3. Icônes Locales (Indispensable pour le packaging Android)
  app.get("/icon-192.png", async (req, res) => {
    try {
      res.sendFile(path.join(currentDirname, "public", "icon-192.png"));
    } catch (e) {
      res.status(404).end();
    }
  });

  app.get("/icon-512.png", async (req, res) => {
    try {
      res.sendFile(path.join(currentDirname, "public", "icon-512.png"));
    } catch (e) {
      res.status(404).end();
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /");
  });

  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send("self.addEventListener('fetch', (event) => { event.respondWith(fetch(event.request)); });");
  });

  app.use(express.json({ limit: '50mb' }));
  
  // Server-side processing to bypass Wix/Browser restrictions
  app.post("/api/process-image", async (req, res) => {
    const { image, mimeType, finishOption } = req.body;
    
    // Priority: 1. GEMINI_API_KEY, 2. CLE_ASPHALTE, 3. API_KEY
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.CLE_ASPHALTE || 
                   process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "CONFIGURATION REQUISE : Clé API Gemini manquante. Veuillez configurer votre clé 'GEMINI_API_KEY' via le menu Paramètres (Settings) de Google AI Studio."
      });
    }

    const isGlossy = finishOption === 'glossy';
    const finishPrompt = isGlossy
      ? "Modify this image to show a freshly sealed asphalt driveway. Keep any public street, public road, sidewalk, or neighboring asphalt completely untouched and in its original state; only transform the private driveway area that belongs to the house. The private driveway's asphalt should be transformed into a uniform, rich, deep glossy black color with a beautiful shiny wet-look sheen, reflecting subtle lighting highlights, as if premium asphalt sealer was freshly poured. Remove all cracks, stains, and graying from the driveway asphalt. Ensure the rest of the image (house, grass, cars, sky, walls, public street) remains completely unchanged and realistic. The transition between the new driveway and the surroundings must be seamless and professional. Return only the modified image."
      : "Modify this image to show a freshly sealed asphalt driveway. Keep any public street, public road, sidewalk, or neighboring asphalt completely untouched and in its original state; only transform the private driveway area that belongs to the house. The private driveway's asphalt should be transformed into a uniform, deep matte black color with a subtle granular texture. Remove all cracks, stains, and graying from the driveway asphalt. Ensure the rest of the image (house, grass, cars, sky, walls, public street) remains completely unchanged and realistic. The transition between the new driveway and the surroundings must be seamless and professional. Return only the modified image.";

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Default image model
        contents: {
          parts: [
            {
              inlineData: {
                data: image.split(',')[1] || image,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: finishPrompt,
            },
          ],
        },
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part && part.inlineData) {
        return res.json({ processedImage: `data:image/png;base64,${part.inlineData.data}` });
      }
      
      throw new Error("L'IA n'a pas retourné d'image.");
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Erreur lors du traitement." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Support explicit privacy policy page requests for Google Play Store review
  app.get(["/privacy", "/privacy.html"], (req, res) => {
    res.sendFile(path.join(currentDirname, "public", "privacy.html"));
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: false 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
