/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Zap, Sparkles, Languages } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { applyAsphaltSealant } from './services/gemini';

const translations = {
  fr: {
    appName: "Asphalt",
    appNameSuffix: "Vision",
    designedBy: "conçu par Quantumapp",
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
    footerPassion: "Fait avec passion pour l'asphalte",
    footerRights: "Tous droits réservés.",
    langSwitch: "English"
  },
  en: {
    appName: "Asphalt",
    appNameSuffix: "Vision",
    designedBy: "designed by Quantumapp",
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
    footerPassion: "Made with passion for asphalt",
    footerRights: "All rights reserved.",
    langSwitch: "Français"
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

export default function App() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

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

      const result = await applyAsphaltSealant(base64, file.type);
      setProcessedImage(result);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Désolé, une erreur est survenue lors du traitement de l'image. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
      clearInterval(interval);
    }
  }, []);

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
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
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col group cursor-pointer items-center" onClick={handleReset}>
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight uppercase text-white">{t.appName}<span className="text-emerald-400">{t.appNameSuffix}</span></span>
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
              {t.designedBy}
            </span>
          </div>

          <button 
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-2xl border border-white/10 transition-all text-sm font-medium"
          >
            <Languages className="w-4 h-4 text-emerald-400" />
            <span>{t.langSwitch}</span>
          </button>
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

              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full -z-10" />
                <ImageUploader onImageSelect={processImage} isLoading={isLoading} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <FeatureCard 
                  icon={Zap} 
                  title={t.feature1Title} 
                  description={t.feature1Desc}
                />
                <FeatureCard 
                  icon={ShieldCheck} 
                  title={t.feature2Title} 
                  description={t.feature2Desc}
                />
                <FeatureCard 
                  icon={CheckCircle2} 
                  title={t.feature3Title} 
                  description={t.feature3Desc}
                />
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

          {processedImage && originalImage && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold font-display text-white">{t.resultTitle}</h2>
                <p className="text-zinc-300 text-lg">{t.resultSubtitle}</p>
              </div>
              <ComparisonView 
                original={originalImage} 
                processed={processedImage} 
                onReset={handleReset} 
              />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-600 p-2 rounded-xl">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold font-display tracking-tight uppercase text-white">{t.appName}<span className="text-emerald-400">{t.appNameSuffix}</span></span>
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-2 ml-1 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 inline-block w-fit">
                  {t.designedBy}
                </span>
              </div>
              <p className="text-zinc-400 max-w-sm leading-relaxed">
                {t.footerDesc}
              </p>
            </div>
            <div>
              <h4 className="font-bold font-display mb-4 text-white">Navigation</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t.navHome}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t.navHow}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t.navPricing}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-display mb-4 text-white">Légal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t.legalPrivacy}</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">{t.legalTerms}</a></li>
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
    </div>
  );
}
