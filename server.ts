import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#10b981",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
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
  app.use(express.static(path.join(__dirname, "public")));

  // 3. Icônes Locales (Indispensable pour le packaging Android)
  app.get("/icon-192.png", async (req, res) => {
    try {
      const response = await fetch("https://placehold.co/192x192/10b981/ffffff.png?text=AV");
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      res.send(Buffer.from(buffer));
    } catch (e) {
      res.status(404).end();
    }
  });

  app.get("/icon-512.png", async (req, res) => {
    try {
      const response = await fetch("https://placehold.co/512x512/10b981/ffffff.png?text=AsphaltVision");
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      res.send(Buffer.from(buffer));
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
    const { image, mimeType } = req.body;
    
    // Priority: 1. CLE_ASPHALTE, 2. GEMINI_API_KEY, 3. API_KEY
    const apiKey = process.env.CLE_ASPHALTE || 
                   process.env.GEMINI_API_KEY || 
                   process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "CONFIGURATION REQUISE : Veuillez ajouter votre clé API dans l'onglet 'Secrets' (à gauche) avec le nom 'CLE_ASPHALTE'."
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
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
              text: "Modify this image to show a freshly sealed asphalt driveway. The asphalt areas should be transformed into a uniform, deep matte black color with a subtle granular texture. Remove all cracks, stains, and graying from the asphalt. Ensure the rest of the image (house, grass, cars, sky, walls) remains completely unchanged and realistic. The transition between the new asphalt and the surroundings must be seamless and professional. Return only the modified image.",
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
