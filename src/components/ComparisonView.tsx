import React from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion } from 'motion/react';
import { RefreshCw, Download, Share2 } from 'lucide-react';

interface ComparisonViewProps {
  original: string;
  processed: string;
  onReset: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processed;
    link.download = 'asphalte-pro-vision.png';
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-10">
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
          État Actuel
        </div>
        <div className="absolute top-6 right-6 bg-emerald-600/60 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          Simulation Pro
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-medium">
          Faites glisser pour comparer
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-3 bg-white border-2 border-zinc-200 text-zinc-900 py-4 px-10 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95 w-full sm:w-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Nouvelle Simulation</span>
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center justify-center space-x-3 bg-zinc-900 text-white py-4 px-10 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 w-full sm:w-auto"
        >
          <Download className="w-5 h-5" />
          <span>Sauvegarder l'image</span>
        </button>

        <button
          className="flex items-center justify-center space-x-3 bg-emerald-50 text-emerald-700 py-4 px-6 rounded-2xl font-bold hover:bg-emerald-100 transition-all active:scale-95 w-full sm:w-auto"
        >
          <Share2 className="w-5 h-5" />
          <span className="sm:hidden lg:inline">Partager</span>
        </button>
      </div>
    </div>
  );
};
