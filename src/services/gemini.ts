/**
 * Ce service appelle désormais l'API serveur du backend pour traiter l'image de l'asphalte
 * de manière sécurisée et robuste sans exposer l'API key au navigateur.
 */

export async function applyAsphaltSealant(base64Image: string, mimeType: string): Promise<string> {
  try {
    const response = await fetch("/api/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
        mimeType: mimeType || "image/jpeg",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Le serveur a retourné une erreur lors du traitement.");
    }

    const data = await response.json();
    if (data.processedImage) {
      return data.processedImage;
    }
    throw new Error("Le serveur n'a pas retourné l'image transformée.");
  } catch (error: any) {
    console.error("Erreur d'appel API:", error);
    throw new Error(error.message || "Impossible de se connecter au serveur de traitement.");
  }
}

/**
 * Fonction principale demandée pour l'analyse et la modification de l'asphalte (alias/compatibilité).
 */
export async function analyzeAsphalt(imageAsBase64: string): Promise<string> {
  return applyAsphaltSealant(imageAsBase64, "image/jpeg");
}
