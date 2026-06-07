/**
 * Ce service communique avec le serveur Express pour l'analyse et la modification de l'asphalte.
 * Cela protège la clé API en la gardant côté serveur.
 */

/**
 * Fonction principale demandée pour l'analyse et la modification de l'asphalte via l'API du serveur.
 */
export async function analyzeAsphalt(imageAsBase64: string, mimeType?: string): Promise<string> {
  try {
    const response = await fetch("/api/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageAsBase64,
        mimeType: mimeType || "image/jpeg",
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur serveur: ${response.status}`);
    }

    const data = await response.json();
    if (data.processedImage) {
      return data.processedImage;
    }
    throw new Error("L'IA n'a pas retourné de résultat valide.");
  } catch (error: any) {
    console.error("Erreur lors de l'appel API asphalte:", error);
    throw new Error(error.message || "Désolé, impossible de traiter l'image. Veuillez vérifier la connexion ou la clé API.");
  }
}

/**
 * Alias pour la compatibilité avec le reste de l'application (App.tsx)
 */
export async function applyAsphaltSealant(base64Image: string, mimeType: string): Promise<string> {
  return analyzeAsphalt(base64Image, mimeType);
}

