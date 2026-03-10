import { GoogleGenAI } from "@google/genai";

/**
 * Ce service utilise l'IA Gemini directement depuis le client.
 * Il utilise la clé API VITE_GEMINI_API_KEY (ou la clé par défaut de l'environnement).
 */

// Initialisation du client Gemini avec la clé spécifiée
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

/**
 * Fonction principale demandée pour l'analyse et la modification de l'asphalte.
 * Note: On utilise gemini-2.5-flash-image pour obtenir un résultat visuel (image).
 */
export async function analyzeAsphalt(imageAsBase64: string) {
  try {
    // On utilise le modèle d'image pour réellement "montrer le résultat" comme demandé
    const model = "gemini-2.5-flash-image";
    
    // Vos instructions précises pour le scellant
    const prompt = "Analyse cette entrée de garage et montre le résultat avec un scellant d'asphalte noir neuf et professionnel. Sans fissures et sans trous. Retourne uniquement l'image modifiée.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageAsBase64.split(',')[1] || imageAsBase64,
              mimeType: "image/jpeg"
            }
          },
          {
            text: prompt
          }
        ]
      }
    });
    
    // Extraction de l'image générée
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("L'IA n'a pas retourné d'image modifiée.");
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw new Error("L'IA n'a pas pu répondre.");
  }
}

/**
 * Alias pour la compatibilité avec le reste de l'application (App.tsx)
 */
export async function applyAsphaltSealant(base64Image: string, _mimeType: string): Promise<string> {
  return analyzeAsphalt(base64Image);
}
