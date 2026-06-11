import React from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion } from 'motion/react';
import { RefreshCw, Download } from 'lucide-react';

interface ComparisonViewProps {
  original: string;
  processed: string;
  onReset: () => void;
  lang?: 'fr' | 'en';
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, onReset, lang = 'fr' }) => {
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  const beforeLabel = lang === 'fr' ? 'État Actuel' : 'Current State';
  const afterLabel = lang === 'fr' ? 'Simulation Pro' : 'Pro Simulation';

  return (
    <div className="w-full max-w-6xl mx-auto p-0 sm:p-4 space-y-10">
      {/* Block Slider: Interactive comparison with custom taller aspect ratios for mobile & desktop */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-[6px] sm:border-[12px] border-white/95 bg-zinc-950 aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] group"
      >
        <ReactCompareSlider
          itemOne={<ReactCompareSliderImage src={original} alt="Avant" className="object-cover w-full h-full" />}
          itemTwo={<ReactCompareSliderImage src={processed} alt="Après" className="object-cover w-full h-full" />}
          className="h-full w-full"
          handle={
            <div className="w-1.5 h-full bg-white relative flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-500 transform active:scale-110 transition-transform">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                  <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          }
        />
        
        {/* Dynamic Badges positioned responsively without clutter */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-zinc-900/90 backdrop-blur-md border border-white/10 text-zinc-100 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider select-none shadow-lg">
          {beforeLabel}
        </div>
        
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-emerald-600/95 backdrop-blur-md border border-emerald-400/20 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider select-none shadow-lg">
          {afterLabel}
        </div>

        {/* Dynamic helper text inside image */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/65 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] sm:text-xs font-medium pointer-events-none select-none">
          {lang === 'fr' ? 'Faites glisser pour comparer' : 'Slide to compare'}
        </div>
      </motion.div>

      {/* Block 2: Download actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
        <button
          onClick={() => handleDownload(processed, `vision-asphalte-${lang}.png`)}
          className="flex items-center justify-center space-x-3 bg-emerald-600 text-white py-4 px-10 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/45 active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{lang === 'fr' ? 'Enregistrer la simulation' : 'Save simulation'}</span>
        </button>
      </div>

      {/* Block 3: New Simulation */}
      <div className="flex justify-center pt-6 border-t border-white/10 px-4 sm:px-0">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white py-4 px-10 rounded-2xl font-bold transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          <span>{lang === 'fr' ? 'Nouvelle Simulation' : 'New Simulation'}</span>
        </button>
      </div>
    </div>
  );
};
