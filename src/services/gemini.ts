import { GoogleGenAI } from "@google/genai";

/**
 * Ce service utilise l'IA Gemini directement depuis le client (sans serveur).
 * Il utilise la clé API configurée dans votre environnement.
 */

// Initialisation du client Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyse une image d'entrée de garage et applique virtuellement un scellant d'asphalte.
 * @param base64Image L'image originale en format Base64
 * @param mimeType Le type MIME de l'image (ex: image/jpeg)
 * @returns L'image traitée en format Base64
 */
export async function applyAsphaltSealant(base64Image: string, mimeType: string): Promise<string> {
  try {
    // Extraction des données pures (sans le préfixe data:image/...)
    const base64Data = base64Image.split(',')[1] || base64Image;
    
    // On utilise gemini-2.5-flash-image pour obtenir un résultat visuel (image)
    const model = 'gemini-2.5-flash-image';
    
    // Vos instructions précises pour le scellant (Prompt de Steve)
    const prompt = "Analyse cette entrée de garage et montre le résultat avec un scellant d'asphalte noir neuf et professionnel. Sans fissures et sans trous. Retourne uniquement l'image modifiée.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extraction de l'image générée dans la réponse
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("L'IA n'a pas retourné d'image modifiée.");
  } catch (error: any) {
    console.error("Erreur IA Gemini:", error);
    
    if (error.message?.includes("API key")) {
      throw new Error("Clé API manquante ou invalide. Assurez-vous qu'elle est bien configurée.");
    }
    
    throw new Error("Impossible d'analyser l'image pour le moment. Réessayez plus tard.");
  }
}

// Alias pour la compatibilité avec d'autres parties du code si nécessaire
export const analyzeAsphalt = applyAsphaltSealant;
