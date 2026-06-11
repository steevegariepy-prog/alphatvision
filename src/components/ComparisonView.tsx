import React, { useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Download, Maximize2, X } from 'lucide-react';

interface ComparisonViewProps {
  original: string;
  processed: string;
  onReset: () => void;
  lang?: 'fr' | 'en';
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, onReset, lang = 'fr' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-12">
      {/* Block Slider: Interactive comparison with slide controller */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-[12px] border-white bg-zinc-100 aspect-[4/3] md:aspect-video group"
      >
        <ReactCompareSlider
          itemOne={<ReactCompareSliderImage src={original} alt="Avant" className="object-cover" />}
          itemTwo={<ReactCompareSliderImage src={processed} alt="Après" className="object-cover" />}
          className="h-full w-full"
          handle={
            <div className="w-1 h-full bg-white relative flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-500">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          }
        />
        
        <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          {lang === 'fr' ? 'Actuel' : 'Current'}
        </div>
        
        {/* Discrete Centered Enlarge Button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 text-white p-2 sm:px-4 sm:py-2 rounded-full shadow-lg transition-all cursor-pointer flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider active:scale-95 z-10"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lang === 'fr' ? 'Agrandir' : 'Enlarge'}</span>
        </button>

        <div className="absolute top-6 right-6 bg-emerald-600/60 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          {lang === 'fr' ? 'Scellant frais' : 'Fresh sealant'}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs sm:text-sm font-medium pointer-events-none">
          {lang === 'fr' ? 'Faites glisser pour comparer' : 'Slide to compare'}
        </div>
      </motion.div>

      {/* Block 2: Download actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => handleDownload(processed, 'asphalte-pro-vision.png')}
          className="flex items-center justify-center space-x-3 bg-emerald-600 text-white py-4 px-10 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{lang === 'fr' ? 'Enregistrer la simulation' : 'Save simulation'}</span>
        </button>
      </div>

      {/* Block 3: New Simulation */}
      <div className="flex justify-center pt-8 border-t border-zinc-200">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-3 bg-white border-2 border-zinc-200 text-zinc-900 py-4 px-10 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          <span>{lang === 'fr' ? 'Nouvelle Simulation' : 'New Simulation'}</span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black backdrop-blur-md flex flex-col items-center justify-start sm:justify-center p-0 sm:p-6"
          >
            {/* Header of overlay - Sticky/Float on top */}
            <div className="w-full max-w-6xl flex items-center justify-between p-4 sm:px-0 sm:pb-4 text-white">
              <div className="flex flex-col">
                <h4 className="text-sm sm:text-base font-bold font-display tracking-wide uppercase">
                  {lang === 'fr' ? 'Simulation Plein Écran' : 'Fullscreen Simulation'}
                </h4>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {lang === 'fr' ? 'Faites glisser pour comparer' : 'Slide to compare'}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all border border-white/10 cursor-pointer active:scale-95 flex items-center justify-center shadow-lg"
                title={lang === 'fr' ? 'Fermer' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immersive simulated Slider inside fullscreen (edge-to-edge on mobile, bordered on desktop) */}
            <div className="w-full flex-1 sm:flex-initial max-w-6xl aspect-[3/4] sm:aspect-video rounded-none sm:rounded-[2rem] overflow-hidden border-y sm:border-[8px] border-zinc-850 bg-zinc-950 relative shadow-2xl">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={original} alt="Avant" className="object-cover w-full h-full" />}
                itemTwo={<ReactCompareSliderImage src={processed} alt="Après" className="object-cover w-full h-full" />}
                className="h-full w-full"
                handle={
                  <div className="w-1 h-full bg-white relative flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-500 transform active:scale-110 transition-transform">
                      <div className="flex space-x-0.5">
                        <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                        <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                }
              />
              
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                {lang === 'fr' ? 'Actuel' : 'Current'}
              </div>
              <div className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-md border border-emerald-400/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                {lang === 'fr' ? 'Scellant frais' : 'Fresh sealant'}
              </div>
            </div>

            {/* Instruction footer inside fullscreen */}
            <div className="w-full text-center py-4 sm:py-2 select-none">
              <p className="text-zinc-500 text-xs px-4">
                {lang === 'fr' ? 'Faites glisser le séparateur central' : 'Slide the central separator to compare'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
