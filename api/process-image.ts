import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, mimeType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY ||
                 process.env.CLE_ASPHALTE ||
                 process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API Gemini manquante." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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

    const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (part && part.inlineData) {
      return res.json({ processedImage: `data:image/png;base64,${part.inlineData.data}` });
    }

    throw new Error("L'IA n'a pas retourné d'image.");
  } catch (error: any) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message || "Erreur lors du traitement." });
  }
}
