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
const backgroundImage = '/luxury_sealed_driveway.jpg';

const MAX_FREE_USES = 3;
const STORAGE_KEY = 'av_uses';
const STORAGE_KEY_PURCHASED = 'av_purchased_uses';
const STRIPE_PROCESSED_SESSIONS_KEY = 'av_processed_sessions';

let hasProcessedSuccessThisMount = false;

function getProcessedSessions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STRIPE_PROCESSED_SESSIONS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function markSessionAsProcessed(sessionId: string) {
  const processed = getProcessedSessions();
  if (!processed.includes(sessionId)) {
    processed.push(sessionId);
    localStorage.setItem(STRIPE_PROCESSED_SESSIONS_KEY, JSON.stringify(processed));
  }
}

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
    appNameSuffix: "Vision Pro",
    designedBy: "conçu par Quantumapp • Outil de Vente Pro",
    calculatorTitle: "Estimation Rapide",
    aiPowered: "Outil de Vente IA Professionnel",
    heroTitle: "Doublez vos ventes de",
    heroTitleHighlight: "scellant d'asphalte",
    heroTitleSuffix: "en direct devant le client",
    heroSubtitle: "Le premier visualisateur d'asphalte par IA conçu exclusivement pour les estimateurs et entrepreneurs. Prenez une photo de l'entrée de votre prospect sur place et montrez-lui l'impact immédiat d'un fini noir mat rajeuni pour signer le contrat sur le champ.",
    brochureBadge: "📈 CONVERSION PRO : +30% DE CONTRATS SIGNÉS",
    brochureMainSlogan: "PROUVEZ LE RÉSULTAT EN DIRECT À VOTRE CLIENT",
    benefitBullet1: "Affichez un aperçu instantané haute résolution",
    benefitBullet2: "Émerveillez le client & éliminez les objections de prix",
    benefitBullet3: "Propulsez vos signatures de contrats d'asphalte de 30%",
    feature1Title: "Signez vos devis 2x plus vite",
    feature1Desc: "Fini les hésitations du client. Une démonstration visuelle photoréaliste en 15 secondes neutralise les objections de prix et déclenche l'acte d'achat.",
    feature2Title: "Éliminez tous les doutes",
    feature2Desc: "Faites comparer en direct les finis Mat et Satiné pour rassurer le client avant que votre équipe n'ouvre le premier baril de scellant.",
    feature3Title: "Présentation Élite de Vente",
    feature3Desc: "Propulsez votre image de marque au-dessus de la concurrence locale avec un argument technologique haut de gamme sur votre téléphone ou tablette.",
    loadingSteps: [
      "Analyse de l'entrée du client...",
      "Identification précise des zones d'asphalte...",
      "Simulation d'application du scellant bitumineux...",
      "Application du fini professionnel haute protection...",
      "Finalisation de la démonstration de vente..."
    ],
    loadingSub: "Génération de la simulation de vente en direct...",
    resultTitle: "Votre simulation de vente est prête",
    resultSubtitle: "Faites glisser le curseur pour convaincre votre client.",
    errorTitle: "Une erreur est survenue lors de l'analyse",
    errorRetry: "Prendre une nouvelle photo de l'entrée",
    footerDesc: "L'application de démonstration n°1 au Québec et Canada pour clore plus de contrats de scellant d'asphalte sur le terrain.",
    navHome: "Console Pro",
    navHow: "Bénéfices Vendeurs",
    navPricing: "Licence d'utilisation",
    legalPrivacy: "Confidentialité",
    legalTerms: "Conditions d'utilisation",
    legalDisclaimer: "Limitatif et conditions de simulation",
    footerPassion: "Développé pour les entrepreneurs en asphalte",
    footerRights: "Tous droits réservés.",
    langSwitch: "English",
    exampleTitle: "Démonstrateur Interactif de Vente",
    exampleSubtitle: "Voici ce que vos représentants montrent sur leur cellulaire pour clôturer un client indécis en quelques secondes et augmenter la valeur perçue de l'asphalte.",
    statusBefore: "AVANT : ENTRÉE VIEILLIE",
    statusAfter: "APRÈS : SCELLANT DE QUALITÉ APPLIQUÉ",
    stampBadge: "SCELLANT APPLIQUÉ",
    stampCertified: "SIMULATION CERTIFIÉE",
    freeRemaining: (n: number) => `${n} simulation${n > 1 ? 's' : ''} d'essai restante${n > 1 ? 's' : ''}`,
    paywallTitle: "Limite d'estimations gratuite atteinte",
    paywallSubtitle: "Équipez votre représentant avec 150 simulations supplémentaires pour seulement 9,99$ (moins de 0,07$ par client présenté).",
    paywallFeature1: "150 simulations de haute qualité pour seulement 9,99$",
    paywallFeature2: "Les crédits n'expirent jamais (valides toute la saison)",
    paywallFeature3: "Rentabilité immédiate dès le premier contrat fermé",
    paywallCta: "Recharger 150 crédits de vente (9,99$)",
    paywallPrice: "9,99$",
    paywallClose: "Fermer",
    uploaderTitle: "Lancer une simulation client",
    uploaderSubtitle: "Prenez une photo de l'entrée du client ou glissez une photo existante pour démarrer le pitch de vente.",
    uploaderCamera: "Prendre en photo l'entrée",
    uploaderGallery: "Importer depuis l'album",
    uploaderFormat: "Formats d'images pris en charge : JPG, PNG, HEIC",
    examplePreview: "Démo de vente",
    exampleUploadPrompt: "Prenez en photo l'entrée de votre client ci-dessus pour simuler en direct !",
  },
  en: {
    appName: "Asphalt",
    appNameSuffix: "Vision Pro",
    designedBy: "designed by Quantumapp • Contractor Sales Tool",
    calculatorTitle: "Quick Estimation",
    aiPowered: "Professional AI Sales Tool",
    heroTitle: "Double your asphalt sealing",
    heroTitleHighlight: "contract conversions",
    heroTitleSuffix: "live in front of clients",
    heroSubtitle: "The #1 AI-powered asphalt visualizer built exclusively for sales reps and pavement contractors. Tap a photo of your prospect's driveway on-site and instantly reveal a stunning simulated fresh finish to close deals instantly.",
    brochureBadge: "📈 PRO SALES BOOST: +30% CLOSED CONTRACTS",
    brochureMainSlogan: "PROVE THE RESULT LIVE TO YOUR PROSPECT",
    benefitBullet1: "Generate a crisp instant high-res split preview",
    benefitBullet2: "Impress the customer & bypass any price hesitation",
    benefitBullet3: "Boost your local asphalt contract conversions by 30%",
    feature1Title: "Close Quotes 2x Faster",
    feature1Desc: "Eradicate customer hesitation completely. A photorealistic finish in 15 seconds dissolves price objections and closes deals immediately.",
    feature2Title: "No More Indecisions",
    feature2Desc: "Compare Matte and Satin finishes under real conditions to guide the customer to build perfect trust before your crew arrives.",
    feature3Title: "Elite Premium Pitch",
    feature3Desc: "Upgrade your contractor brand far above generic paper estimates with a modern tech-driven mobile presentation.",
    loadingSteps: [
      "Analyzing client's driveway...",
      "Pinpointing asphalt areas...",
      "Simulating bituminous sealer application...",
      "Applying elite high-protection dark coat...",
      "Wrapping up visual sales preview..."
    ],
    loadingSub: "Generating live sales preview on-the-go...",
    resultTitle: "Your sales simulation is ready",
    resultSubtitle: "Slide the bar to close your prospect on the spot.",
    errorTitle: "An error occurred during analysis",
    errorRetry: "Cap new driveway photo",
    footerDesc: "The ultimate B2B sales booster tool for residential and commercial driveway sealing professionals.",
    navHome: "Pro Console",
    navHow: "Sales Benefits",
    navPricing: "License & Packs",
    legalPrivacy: "Privacy Policy",
    legalTerms: "Terms of Use",
    legalDisclaimer: "Disclaimer",
    footerPassion: "Crafted for paving & sealing contractors",
    footerRights: "All rights reserved.",
    langSwitch: "Français",
    exampleTitle: "Interactive Live Sales Demonstrator",
    exampleSubtitle: "This is exactly what your sales reps show on their phones to close tentative prospects in seconds and boost driveway perceived value.",
    statusBefore: "BEFORE: AGED ENTRANCE",
    statusAfter: "AFTER: BITUMEN SEALANT RESULT",
    stampBadge: "SEALANT APPLIED",
    stampCertified: "CERTIFIED PREVIEW",
    freeRemaining: (n: number) => `${n} trial simulation${n > 1 ? 's' : ''} remaining`,
    paywallTitle: "Free Quote Limit Reached",
    paywallSubtitle: "Equip your sales team with 150 additional simulations for only $9.99 (under $0.07 per prospective pitch).",
    paywallFeature1: "150 high-precision simulations for only $9.99",
    paywallFeature2: "Credits stack and never expire (perfect for seasonal crews)",
    paywallFeature3: "Instantly profitable with your very first closed deal",
    paywallCta: "Refill 150 Sales Credits ($9.99)",
    paywallPrice: "$9.99",
    paywallClose: "Close",
    uploaderTitle: "Launch Client Simulation",
    uploaderSubtitle: "Snap a live photo of client's driveway or select an existing project to kick off your presentation.",
    uploaderCamera: "Snap driveway photo",
    uploaderGallery: "Import from gallery",
    uploaderFormat: "Supported image formats: JPG, PNG, HEIC",
    examplePreview: "Interactive Demo",
    exampleUploadPrompt: "Snap or upload your prospect's driveway image above to demo live!",
  }
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -6, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="bg-black p-7 rounded-[2rem] border border-zinc-800 shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)] transition-all duration-300"
  >
    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <h3 className="text-xl font-bold font-display text-white mb-2 tracking-tight">{title}</h3>
    <p className="text-zinc-100 text-sm leading-relaxed font-medium">{description}</p>
  </motion.div>
);

function PaywallModal({ t, onClose }: { t: typeof translations['fr'], onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/75 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">{t.paywallTitle}</h2>
            <p className="text-slate-300 font-medium">{t.paywallSubtitle}</p>
          </div>

          <div className="space-y-3 text-left">
            {[t.paywallFeature1, t.paywallFeature2, t.paywallFeature3].map((f, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-100 font-medium">{f}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open('https://buy.stripe.com/5kQaEW0GG0wO14xcz128802', '_blank')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] border border-emerald-400/20 flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>{t.paywallCta}</span>
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
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        const processed = getProcessedSessions();
        if (!processed.includes(sessionId)) {
          markSessionAsProcessed(sessionId);
          addPurchasedUses(150);
          setUsesLeft(remainingUses());
        }
      } else {
        // Fallback for when session_id is not passed by Stripe configuration
        if (!hasProcessedSuccessThisMount) {
          hasProcessedSuccessThisMount = true;
          addPurchasedUses(150);
          setUsesLeft(remainingUses());
        }
      }
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
      // Compression de l'image (resize) pour éviter les erreurs de taille (413 Payload Too Large)
      const compressImage = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
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
              if (!ctx) return resolve(img.src);
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => reject(new Error('Erreur de lecture de l\'image'));
          };
          reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        });
      };

      const base64 = await compressImage(file);
      setOriginalImage(base64);

      const [matteResult, glossyResult] = await Promise.all([
        applyAsphaltSealant(base64, "image/jpeg", 'matte'),
        applyAsphaltSealant(base64, "image/jpeg", 'glossy')
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-100 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 animate-fade-in">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-slate-950/95" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col group cursor-pointer items-start" onClick={handleReset}>
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-1.5 sm:p-2 rounded-xl">
                <Droplets className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight uppercase text-white">{t.appName}<span className="text-emerald-400">{t.appNameSuffix}</span></span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-1 ml-1 select-none">
              {t.designedBy}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Single clean Calculator button, fully responsive */}
            <button 
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl sm:rounded-2xl border border-emerald-500/20 transition-all text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span>{lang === 'fr' ? 'Calculateur' : 'Estimator'}</span>
            </button>

            {/* Language switcher */}
            <button 
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-800 transition-all text-xs sm:text-sm font-semibold cursor-pointer active:scale-95"
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
              <div className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                  {/* Floating Brochure-inspired high-converting ribbon */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-full border border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.25)] flex items-center space-x-2 text-xs sm:text-sm font-bold tracking-wide uppercase"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-emerald-200 animate-ping shrink-0" />
                    <span>{t.brochureBadge}</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-900 text-slate-300 px-6 py-2 rounded-3xl border border-slate-800 shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">{t.aiPowered}</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-slate-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                      {t.designedBy}
                    </span>
                  </motion.div>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-white leading-[1.05]">
                  {t.heroTitle} <span className="text-emerald-400 relative inline-block">
                    {t.heroTitleHighlight}
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                    </svg>
                  </span> {t.heroTitleSuffix}
                </h1>

                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                  {t.heroSubtitle}
                </p>

                {/* 3 High-Conversion checklist badges from the flyer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-left">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-slate-900 border border-slate-800 shadow-[0_15px_30px_rgba(0,0,0,0.25)] p-4 rounded-2xl backdrop-blur-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold border border-emerald-500/20">
                      ✓
                    </div>
                    <span className="text-sm font-semibold text-slate-200 leading-tight">{t.benefitBullet1}</span>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-slate-900 border border-slate-800 shadow-[0_15px_30px_rgba(0,0,0,0.25)] p-4 rounded-2xl backdrop-blur-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold border border-emerald-500/20">
                      ✓
                    </div>
                    <span className="text-sm font-semibold text-slate-200 leading-tight">{t.benefitBullet2}</span>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-emerald-950/40 border border-emerald-500/20 shadow-[0_15px_30px_rgba(0,0,0,0.25)] p-4 rounded-2xl backdrop-blur-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 font-bold">
                      ★
                    </div>
                    <span className="text-sm font-bold text-emerald-300 leading-tight">{t.benefitBullet3}</span>
                  </motion.div>
                </div>
              </div>


              {/* Quota / trial indicator (Talon d'accès) ou Forfait Premium */}
              {usesLeft <= MAX_FREE_USES + getPurchasedUses() && (
                <div className="flex flex-col items-center justify-center space-y-3 bg-slate-900 border border-slate-800 p-5 rounded-[2rem] max-w-sm mx-auto shadow-xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
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
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_10px_35px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] border border-emerald-500/20 cursor-pointer"
                    >
                      {lang === 'fr' ? 'Acheter des simulations' : 'Buy simulations'}
                    </button>
                  )}
                  {getPurchasedUses() > 0 && usesLeft > 0 && (
                     <button
                       onClick={() => setShowPaywall(true)}
                       className="border border-slate-800 hover:bg-slate-800 text-slate-350 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                     >
                       {lang === 'fr' ? 'Recharger des crédits' : 'Recharge credits'}
                     </button>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/5 blur-3xl rounded-full -z-10" />
                {usesLeft === 0 ? (
                  <div
                    onClick={() => setShowPaywall(true)}
                    className="relative cursor-pointer"
                  >
                    <div className="pointer-events-none opacity-50">
                      <ImageUploader onImageSelect={processImage} isLoading={isLoading} t={t} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-3xl backdrop-blur-sm">
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
              <div className="pt-16 max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.examplePreview}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">{t.exampleTitle}</h2>
                  <p className="text-slate-300 max-w-xl mx-auto leading-relaxed text-sm">{t.exampleSubtitle}</p>
                </div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="relative rounded-[2.5rem] overflow-hidden border-[10px] sm:border-[14px] border-slate-900 bg-slate-950 shadow-[0_30px_70px_rgba(0,0,0,0.55)] max-w-4xl mx-auto flex flex-col group"
                >
                  {/* Tablet/Device Header Toolbar mimicking mobile sales system */}
                  <div className="bg-slate-900 border-b border-white/5 py-3 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-white font-bold uppercase tracking-widest">ASPHALT VISION PRO PRESENTATION • v1.4</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                      <span>📶 LTE 5G LIVE DEMO</span>
                      <span className="text-emerald-400">⚡ BATTERY 100% ONLINE</span>
                    </div>
                  </div>

                  {/* Brochure Main Slogan Banner inside the app emulator */}
                  <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-center py-4 border-b border-emerald-400/20 shadow-md">
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 px-4">
                       ⭐ {t.brochureMainSlogan} ⭐
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden">
                    <img 
                      src="/driveway_comparison.png" 
                      alt="Comparaison de scellant d'asphalte" 
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                    />

                    {/* Elegant central physical divider indicating split status */}
                    <div className="absolute inset-y-0 left-1/2 w-1 sm:w-1.5 bg-gradient-to-b from-white/10 via-white/80 to-white/10 backdrop-blur-xs -translate-x-1/2 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 border-[3px] sm:border-[4px] border-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center select-none transform group-hover:scale-110 transition-transform duration-300">
                        <span className="font-display font-black text-white text-xs tracking-tight">VS</span>
                      </div>
                    </div>

                    {/* Absolute overlays for badges & instructions */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-8">
                      <div className="flex justify-between items-start w-full">
                        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white font-display font-bold uppercase tracking-widest text-[9px] sm:text-xs px-3 sm:px-5 py-2 rounded-xl shadow-lg">
                          {t.statusBefore}
                        </div>
                        <div className="bg-emerald-600/95 backdrop-blur-md border border-emerald-400/20 text-white font-display font-bold uppercase tracking-widest text-[9px] sm:text-xs px-3 sm:px-5 py-2 rounded-xl shadow-lg">
                          {t.statusAfter}
                        </div>
                      </div>

                      {/* Rotating Seal Stamp Overlay (mimicking the brochure's circular stamp) */}
                      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 pointer-events-auto bg-slate-950/95 backdrop-blur-lg border border-emerald-500/30 rounded-full p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                          {/* Svg Circular Text */}
                          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                            <defs>
                              <path id="textPath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                            </defs>
                            <text className="font-mono text-[6.5px] sm:text-[7.5px] font-bold fill-emerald-400 tracking-[0.18em]" letterSpacing="1px">
                              <textPath href="#textPath" startOffset="0%">
                                {t.stampCertified} • {t.stampBadge} •
                              </textPath>
                            </text>
                          </svg>
                          {/* Inner checkmark icon */}
                          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <span className="text-white text-sm sm:text-lg font-black leading-none">✓</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full text-center">
                        <span className="inline-block bg-slate-900/90 backdrop-blur-md text-white text-xs px-5 py-2.5 rounded-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {t.exampleUploadPrompt}
                        </span>
                      </div>
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
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Droplets className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">{loadingMessages[loadingStep]}</h3>
                  <p className="text-slate-400">{t.loadingSub}</p>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
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
                <p className="text-slate-300 text-lg">{t.resultSubtitle}</p>
                {usesLeft > 0 && (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 px-3 py-1.5 rounded-2xl text-xs font-medium">
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
                    lang={lang}
                  />
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold font-display text-center text-white">{lang === 'fr' ? 'Finition Noir Brillant' : 'Glossy Black Finish'}</h3>
                  <ComparisonView 
                    original={originalImage} 
                    processed={processedImages.glossy} 
                    onReset={handleReset} 
                    lang={lang}
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
              className="max-w-xl mx-auto bg-slate-900 border border-red-500/20 p-8 rounded-[2rem] shadow-xl shadow-red-500/5 flex items-start space-x-6"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-display text-red-300">{t.errorTitle}</h3>
                  <p className="text-red-400/80 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  {t.errorRetry}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950/85 backdrop-blur-xl relative z-10">
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
                <span className="text-xs font-bold text-slate-400 font-mono tracking-widest mt-2 ml-1">
                  {t.designedBy}
                </span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">{t.footerDesc}</p>
            </div>
            <div>
              <h4 className="font-bold font-display mb-4 text-white">Légal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setActiveLegalModal('privacy')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">{t.legalPrivacy}</button></li>
                <li><button onClick={() => setActiveLegalModal('terms')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">{t.legalTerms}</button></li>
                <li><button onClick={() => setActiveLegalModal('disclaimer')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">{t.legalDisclaimer}</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
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
