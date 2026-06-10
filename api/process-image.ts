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
    ? "Modify ONLY the driveway surface to show a fresh, professional SATIN-GLOSS bitumen sealant look (scellant de bitume lustré). Transform the driveway into a deep, rich, saturated carbon-black color with a soft, uniform oil-satin finish. This must look like coated asphalt, NOT a flat pool of liquid water or a perfect mirror reflection. It should gently catch the sunlight with soft, dispersed satin sheen highlights, emphasizing the fine, realistic granular aggregate texture of the asphalt. Remove all cracks and stains. The house, grass, brick borders, and sky must remain absolutely unchanged and realistic, with clean, professional edge transitions."
    : "Modify ONLY the driveway surface to show a fresh, professional MATTE bitumen sealant finish (scellant de bitume mat). Transform the driveway into a uniform, deep rich charcoal-black color with a flat, non-reflective surface. The texturing should look like dry asphalt with a fine, detailed granular aggregate structure. There must be absolutely no reflections, no specular glare, and no glossy/wet appearance. Remove all cracks, old lines, and weathered gray patches. The house, lawn, borders, and sky must remain completely untouched, with a seamless, crisp border transition.";

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
