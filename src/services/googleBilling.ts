// Détecte si on est dans le contexte Google Play Store
export function isPlayStoreContext(): boolean {
  return 'getDigitalGoodsService' in window;
}

// Lance l'achat via Google Play Billing
export async function purchaseWithGooglePlay(): Promise<string | null> {
  try {
    const service = await (window as any).getDigitalGoodsService(
      'https://play.google.com/billing'
    );

    const [item] = await service.getDetails(['visualizations_150']);
    if (!item) throw new Error('Produit introuvable');

    const paymentRequest = new PaymentRequest(
      [{
        supportedMethods: 'https://play.google.com/billing',
        data: { sku: 'visualizations_150' }
      }],
      {
        total: {
          label: '150 Visualizations',
          amount: { currency: 'USD', value: '9.99' }
        }
      }
    );

    const response = await paymentRequest.show();
    const purchaseToken = response.details.purchaseToken;

    // Valider côté serveur
    const validation = await fetch('/api/validate-google-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseToken })
    });

    if (!validation.ok) throw new Error('Validation échouée');

    await response.complete('success');
    return purchaseToken;

  } catch (err) {
    console.error('Google Play Billing error:', err);
    return null;
  }
}
