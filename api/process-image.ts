import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, mimeType, finishOption } = req.body;

  const apiKey = process.env.GEMINI_API_KEY ||
                 process.env.CLE_ASPHALTE ||
                 process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API Gemini manquante." });
  }

  const promptText = finishOption === 'glossy' 
    ? "Change ONLY the driveway surface to be EXTREMELY SHINY, WET, and HIGHLY REFLECTIVE black. It must look exactly like fresh, wet glossy tar or premium wet-look asphalt sealant. Force bright, glaring white reflections of the sky and environment onto the driveway surface. The driveway must look like a sleek, wet mirror. Do not touch or change the house, grass, sky, or anything else."
    : "Change ONLY the driveway surface to be a FLAT, DRY, DULL, MATTE charcoal-black color. It must look like standard dry asphalt with absolutely NO shine and NO reflections. It must look completely dry, rough, and textured. Do not touch or change the house, grass, sky, or anything else.";

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
            text: promptText,
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
