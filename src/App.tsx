/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Zap, Sparkles, Languages, Eye, X, Lock, Crown, Calculator } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { LegalModal, LegalDocumentType } from './components/LegalModal';
import { DrivewayCalculator } from './components/DrivewayCalculator';
import { applyAsphaltSealant } from './services/gemini';

const MAX_FREE_USES = 3;
const STORAGE_KEY = 'av_uses';
const STORAGE_KEY_PURCHASED = 'av_purchased_uses';

function getUseCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0');
}
function incrementUseCount(): number {
  const next = getUseCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}
function getPurchasedUses(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY_PURCHASED) || '0');
}
function addPurchasedUses(amount: number) {
  const next = getPurchasedUses() + amount;
  localStorage.setItem(STORAGE_KEY_PURCHASED, String(next));
}
function canUse(): boolean {
  return getUseCount() < MAX_FREE_USES + getPurchasedUses();
}
function remainingUses(): number {
  return Math.max(0, (MAX_FREE_USES + getPurchasedUses()) - getUseCount());
}

const translations = {
  fr: {
    appName: "Asphalt",
    appNameSuffix: "Vision",
    designedBy: "conçu par Quantumapp",
    calculatorTitle: "Calculateur",
    aiPowered: "Propulsé par l'IA",
    heroTitle: "Visualisez votre",
    heroTitleHighlight: "entrée de garage",
    heroTitleSuffix: "avec un scellant frais",
    heroSubtitle: "Ne devinez plus. Téléchargez une photo et voyez instantanément comment un scellant professionnel peut transformer l'apparence de votre propriété.",
    feature1Title: "Résultat Instantané",
    feature1Desc: "Obtenez une simulation réaliste en moins de 15 secondes grâce à notre IA spécialisée.",
    feature2Title: "Précision Maximale",
    feature2Desc: "Notre algorithme identifie précisément les zones d'asphalte pour un rendu sans bavure.",
    feature3Title: "Fini Professionnel",
    feature3Desc: "Visualisez un fini noir mat uniforme, exactement comme après une intervention réelle.",
    loadingSteps: [
      "Analyse de l'entrée...",
      "Identification des zones d'asphalte...",
      "Application du scellant bitumineux...",
      "Finition noir mat haute qualité...",
      "Finalisation du rendu réaliste..."
    ],
    loadingSub: "Préparation de votre simulation personnalisée...",
    resultTitle: "Votre simulation est prête",
    resultSubtitle: "Faites glisser le curseur pour voir la différence.",
    errorTitle: "Une erreur est survenue",
    errorRetry: "Réessayer avec une autre photo",
    footerDesc: "La solution n°1 pour visualiser vos projets de scellant d'asphalte avant de commencer les travaux.",
    navHome: "Accueil",
    navHow: "Comment ça marche",
    navPricing: "Tarifs",
    legalPrivacy: "Confidentialité",
    legalTerms: "Conditions d'utilisation",
    legalDisclaimer: "Clause d'exclusion de garantie et de résultats",
    footerPassion: "Fait avec passion pour l'asphalte",
    footerRights: "Tous droits réservés.",
    langSwitch: "English",
    exampleTitle: "Exemple de Résultat Réaliste",
    exampleSubtitle: "Découvrez la différence saisissante avant et après l'application de notre scellant de qualité supérieure.",
    statusBefore: "État Actuel",
    statusAfter: "Simulation Pro",
    freeRemaining: (n: number) => `${n} essai${n > 1 ? 's' : ''} gratuit${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
    paywallTitle: "Vous avez utilisé vos 3 essais gratuits",
    paywallSubtitle: "Achetez un pack de 150 visualisations pour continuer.",
    paywallFeature1: "150 simulations de haute qualité",
    paywallFeature2: "Crédits cumulables & n'expirent jamais",
    paywallFeature3: "Achetez autant de packs que nécessaire",
    paywallCta: "Acheter 150 simulations",
    paywallPrice: "9,99$",
    paywallClose: "Fermer",
    uploaderTitle: "Prêt pour la transformation ?",
    uploaderSubtitle: "Glissez votre photo ici ou choisissez une option ci-dessous.",
    uploaderCamera: "Caméra",
    uploaderGallery: "Galerie",
    uploaderFormat: "Formats acceptés : JPG, PNG, HEIC",
    examplePreview: "Aperçu de la transformation",
    exampleUploadPrompt: "Téléchargez votre photo en haut pour simuler en direct !",
  },
  en: {
    appName: "Asphalt",
    appNameSuffix: "Vision",
    designedBy: "designed by Quantumapp",
    calculatorTitle: "Calculator",
    aiPowered: "AI Powered",
    heroTitle: "Visualize your",
    heroTitleHighlight: "driveway",
    heroTitleSuffix: "with a fresh sealant",
    heroSubtitle: "Stop guessing. Upload a photo and instantly see how a professional sealant can transform your property's look.",
    feature1Title: "Instant Result",
    feature1Desc: "Get a realistic simulation in less than 15 seconds thanks to our specialized AI.",
    feature2Title: "Maximum Precision",
    feature2Desc: "Our algorithm precisely identifies asphalt areas for a clean, professional finish.",
    feature3Title: "Professional Finish",
    feature3Desc: "Visualize a uniform matte black finish, exactly like after a real intervention.",
    loadingSteps: [
      "Analyzing driveway...",
      "Identifying asphalt zones...",
      "Applying bituminous sealant...",
      "High-quality matte black finish...",
      "Finalizing realistic rendering..."
    ],
    loadingSub: "Preparing your personalized simulation...",
    resultTitle: "Your simulation is ready",
    resultSubtitle: "Slide the cursor to see the difference.",
    errorTitle: "An error occurred",
    errorRetry: "Try again with another photo",
    footerDesc: "The #1 solution for visualizing your asphalt sealant projects before starting work.",
    navHome: "Home",
    navHow: "How it works",
    navPricing: "Pricing",
    legalPrivacy: "Privacy Policy",
    legalTerms: "Terms of Use",
    legalDisclaimer: "Disclaimer",
    footerPassion: "Made with passion for asphalt",
    footerRights: "All rights reserved.",
    langSwitch: "Français",
    exampleTitle: "Realistic Result Example",
    exampleSubtitle: "Discover the striking difference before and after applying our high-quality sealant.",
    statusBefore: "Current State",
    statusAfter: "Pro Simulation",
    freeRemaining: (n: number) => `${n} free trial${n > 1 ? 's' : ''} remaining`,
    paywallTitle: "You've used your 3 free trials",
    paywallSubtitle: "Buy a pack of 150 visualizations to continue.",
    paywallFeature1: "150 high-quality simulations",
    paywallFeature2: "Credits stack and never expire",
    paywallFeature3: "Buy as many packs as you need",
    paywallCta: "Buy 150 simulations",
    paywallPrice: "$9.99",
    paywallClose: "Close",
    uploaderTitle: "Ready for transformation?",
    uploaderSubtitle: "Drag your photo here or choose an option below.",
    uploaderCamera: "Camera",
    uploaderGallery: "Gallery",
    uploaderFormat: "Accepted formats: JPG, PNG, HEIC",
    examplePreview: "Transformation preview",
    exampleUploadPrompt: "Upload your photo above to simulate live!",
  }
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
  >
    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <h3 className="text-lg font-bold font-display mb-2">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

function PaywallModal({ t, onClose }: { t: typeof translations['fr'], onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">{t.paywallTitle}</h2>
            <p className="text-zinc-400">{t.paywallSubtitle}</p>
          </div>

          <div className="space-y-3 text-left">
            {[t.paywallFeature1, t.paywallFeature2, t.paywallFeature3].map((f, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-zinc-200">{f}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open('https://buy.stripe.com/5kQaEW0GG0wO14xcz128802', '_blank')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>{t.paywallCta} — {t.paywallPrice}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full text-zinc-500 hover:text-zinc-300 text-sm transition-colors py-2"
            >
              {t.paywallClose}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];
  
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<{ matte: string; glossy: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocumentType>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usesLeft, setUsesLeft] = useState(remainingUses());

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      addPurchasedUses(150);
      setUsesLeft(remainingUses());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadingMessages = t.loadingSteps;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / (loadingMessages.length * 25)), 95));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading, loadingMessages.length]);

  const processImage = useCallback(async (file: File) => {
    // Vérifier les essais disponibles
    if (!canUse()) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep(0);
    setProgress(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;
      setOriginalImage(base64);

      const [matteResult, glossyResult] = await Promise.all([
        applyAsphaltSealant(base64, file.type, 'matte'),
        applyAsphaltSealant(base64, file.type, 'glossy')
      ]);
      setProcessedImages({ matte: matteResult, glossy: glossyResult });
      setProgress(100);

      incrementUseCount();
      setUsesLeft(remainingUses());
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Désolé, une erreur est survenue lors du traitement de l'image. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
      clearInterval(interval);
    }
  }, [loadingMessages.length]);

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImages(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/80 to-zinc-900/95" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col group cursor-pointer items-start" onClick={handleReset}>
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-1.5 sm:p-2 rounded-xl">
                <Droplets className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight uppercase text-white">{t.appName}<span className="text-emerald-400">{t.appNameSuffix}</span></span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1 ml-1 select-none">
              {t.designedBy}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Single clean Calculator button, fully responsive */}
            <button 
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl sm:rounded-2xl border border-emerald-500/20 transition-all text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/30 cursor-pointer active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span>{lang === 'fr' ? 'Calculateur' : 'Estimator'}</span>
            </button>

            {/* Language switcher */}
            <button 
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-xl sm:rounded-2xl border border-white/10 transition-all text-xs sm:text-sm font-medium cursor-pointer active:scale-95"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>{t.langSwitch}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto py-12 md:py-20 px-6">
        <AnimatePresence mode="wait">
          {!originalImage && !isLoading && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex flex-col sm:flex-row items-center gap-3 bg-emerald-400/10 text-emerald-400 px-6 py-3 rounded-3xl border border-emerald-400/20 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">{t.aiPowered}</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-emerald-400/20" />
                  <span className="text-sm font-medium uppercase tracking-widest">
                    {t.designedBy}
                  </span>
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-white leading-[1.05]">
                  {t.heroTitle} <span className="text-emerald-400 relative">
                    {t.heroTitleHighlight}
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                    </svg>
                  </span> {t.heroTitleSuffix}
                </h1>
                <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                  {t.heroSubtitle}
                </p>

              </div>


              {/* Quota / trial indicator (Talon d'accès) ou Forfait Premium */}
              {usesLeft <= MAX_FREE_USES + getPurchasedUses() && (
                <div className="flex flex-col items-center justify-center space-y-3 bg-zinc-950/70 border border-white/10 p-5 rounded-[2rem] max-w-sm mx-auto shadow-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="uppercase tracking-widest">{lang === 'fr' ? 'Crédits Restants' : 'Remaining Credits'}</span>
                  </div>
                  
                  <p className="text-white text-3xl font-black font-display text-center">
                    {usesLeft}
                  </p>
                  
                  {usesLeft === 0 && (
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
                    >
                      {lang === 'fr' ? 'Acheter des simulations' : 'Buy simulations'}
                    </button>
                  )}
                  {getPurchasedUses() > 0 && usesLeft > 0 && (
                     <button
                       onClick={() => setShowPaywall(true)}
                       className="border border-white/10 hover:bg-white/5 text-zinc-300 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors"
                     >
                       {lang === 'fr' ? 'Recharger des crédits' : 'Recharge credits'}
                     </button>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full -z-10" />
                {usesLeft === 0 ? (
                  <div
                    onClick={() => setShowPaywall(true)}
                    className="relative cursor-pointer"
                  >
                    <div className="pointer-events-none opacity-50">
                      <ImageUploader onImageSelect={processImage} isLoading={isLoading} t={t} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 rounded-3xl backdrop-blur-sm">
                      <div className="text-center space-y-3">
                        <Lock className="w-10 h-10 text-emerald-400 mx-auto" />
                        <p className="text-white font-bold">{t.paywallTitle}</p>
                        <button className="bg-emerald-600 text-white px-6 py-2 rounded-2xl font-bold text-sm">
                          {t.paywallCta}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageUploader onImageSelect={processImage} isLoading={isLoading} t={t} />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <FeatureCard icon={Zap} title={t.feature1Title} description={t.feature1Desc} />
                <FeatureCard icon={ShieldCheck} title={t.feature2Title} description={t.feature2Desc} />
                <FeatureCard icon={CheckCircle2} title={t.feature3Title} description={t.feature3Desc} />
              </div>

              {/* Showcase de comparaison d'exemple */}
              <div className="pt-16 max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center space-x-2 bg-emerald-400/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.examplePreview}</span>
                  </div>
                  <h2 className="text-3xl font-bold font-display text-white">{t.exampleTitle}</h2>
                  <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed text-sm">{t.exampleSubtitle}</p>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative rounded-[2.5rem] overflow-hidden border-[12px] border-zinc-800/80 bg-zinc-950 shadow-[0_30px_100px_rgba(0,0,0,0.5)] aspect-[4/3] md:aspect-[16/10] group"
                >
                  <img 
                    src="/driveway_comparison.png" 
                    alt="Comparaison de scellant d'asphalte" 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* Elegant central physical divider indicating split status */}
                  <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-white/10 via-white/50 to-white/10 backdrop-blur-xs -translate-x-1/2 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 border-[4px] border-zinc-900 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center select-none transform group-hover:scale-105 transition-transform">
                      <span className="font-display font-black text-white text-sm tracking-tight">VS</span>
                    </div>
                  </div>

                  {/* Absolute overlays for badges & instructions */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-8">
                    <div className="flex justify-between items-start w-full">
                      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 text-zinc-100 font-display font-medium uppercase tracking-widest text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg">
                        {t.statusBefore}
                      </div>
                      <div className="bg-emerald-600/95 backdrop-blur-md border border-emerald-400/20 text-white font-display font-medium uppercase tracking-widest text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg">
                        {t.statusAfter}
                      </div>
                    </div>
                    <div className="w-full text-center">
                      <span className="inline-block bg-black/60 backdrop-blur-md text-zinc-300 text-xs px-5 py-2.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {t.exampleUploadPrompt}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-10"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 border-t-emerald-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Droplets className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">{loadingMessages[loadingStep]}</h3>
                  <p className="text-zinc-400">{t.loadingSub}</p>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {processedImages && originalImage && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold font-display text-white">{t.resultTitle}</h2>
                <p className="text-zinc-300 text-lg">{t.resultSubtitle}</p>
                {usesLeft > 0 && (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-3 py-1.5 rounded-2xl text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.freeRemaining(usesLeft)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-16">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold font-display text-center text-white">{lang === 'fr' ? 'Finition Noir Mat' : 'Matte Black Finish'}</h3>
                  <ComparisonView 
                    original={originalImage} 
                    processed={processedImages.matte} 
                    onReset={handleReset} 
                  />
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold font-display text-center text-white">{lang === 'fr' ? 'Finition Noir Brillant' : 'Glossy Black Finish'}</h3>
                  <ComparisonView 
                    original={originalImage} 
                    processed={processedImages.glossy} 
                    onReset={handleReset} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto bg-white border border-red-100 p-8 rounded-[2rem] shadow-xl shadow-red-500/5 flex items-start space-x-6"
            >
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-display text-red-900">{t.errorTitle}</h3>
                  <p className="text-red-700/80 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                >
                  {t.errorRetry}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10 bg-zinc-900/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-600 p-2 rounded-xl">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold font-display tracking-tight uppercase text-white">{t.appName}<span className="text-emerald-400">{t.appNameSuffix}</span></span>
                </div>
                <span className="text-xs font-bold text-zinc-500 font-mono tracking-widest mt-2 ml-1">
                  {t.designedBy}
                </span>
              </div>
              <p className="text-zinc-400 max-w-sm leading-relaxed">{t.footerDesc}</p>
            </div>
            <div>
              <h4 className="font-bold font-display mb-4 text-white">Légal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><button onClick={() => setActiveLegalModal('privacy')} className="hover:text-emerald-400 transition-colors text-left">{t.legalPrivacy}</button></li>
                <li><button onClick={() => setActiveLegalModal('terms')} className="hover:text-emerald-400 transition-colors text-left">{t.legalTerms}</button></li>
                <li><button onClick={() => setActiveLegalModal('disclaimer')} className="hover:text-emerald-400 transition-colors text-left">{t.legalDisclaimer}</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
            <div>© {new Date().getFullYear()} {t.appName}{t.appNameSuffix}. {t.footerRights}</div>
            <div className="flex items-center space-x-6">
              <span>{t.footerPassion}</span>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal 
        type={activeLegalModal} 
        onClose={() => setActiveLegalModal(null)} 
        lang={lang} 
      />

      <DrivewayCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        lang={lang}
      />

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <PaywallModal t={t} onClose={() => setShowPaywall(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
