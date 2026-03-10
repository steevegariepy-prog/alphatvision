declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

async function resizeImage(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
  });
}

export async function applyAsphaltSealant(base64Image: string, mimeType: string): Promise<string> {
  try {
    const resizedBase64 = await resizeImage(base64Image);
    
    // Try to get key from window.aistudio if available
    let userApiKey = null;
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      // In some environments, the key is injected into process.env after selection
      // But we can't access process.env here. The server will check its own process.env.
    }

    const response = await fetch("/api/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: resizedBase64,
        mimeType: 'image/jpeg',
        userApiKey: null // The server will use its own env vars
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.needsKeySelection) {
        throw new Error("AUTH_REQUIRED");
      }
      throw new Error(data.error || "Erreur serveur.");
    }

    return data.processedImage;
  } catch (error: any) {
    console.error("Client Error:", error);
    throw error;
  }
}
