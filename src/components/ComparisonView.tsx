import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Download } from 'lucide-react';

interface ComparisonViewProps {
  original: string;
  processed: string;
  onReset: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, onReset }) => {
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-16">
      {/* Block 1: Original Image */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-[12px] border-white bg-zinc-100 aspect-[4/3] md:aspect-video"
        >
          <img src={original} alt="Avant" className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            État Actuel
          </div>
        </motion.div>
        
        <div className="flex justify-center">
          <button
            onClick={() => handleDownload(original, 'asphalte-original.png')}
            className="flex items-center justify-center space-x-3 bg-zinc-900 text-white py-4 px-10 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Enregistrer l'original</span>
          </button>
        </div>
      </div>

      {/* Block 2: Processed Image */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-[12px] border-white bg-zinc-100 aspect-[4/3] md:aspect-video"
        >
          <img src={processed} alt="Après" className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-emerald-600/60 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Simulation Pro
          </div>
        </motion.div>

        <div className="flex justify-center">
          <button
            onClick={() => handleDownload(processed, 'asphalte-pro-vision.png')}
            className="flex items-center justify-center space-x-3 bg-zinc-900 text-white py-4 px-10 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Enregistrer la simulation</span>
          </button>
        </div>
      </div>

      {/* Block 3: New Simulation */}
      <div className="flex justify-center pt-8 border-t border-zinc-200">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-3 bg-white border-2 border-zinc-200 text-zinc-900 py-4 px-10 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95 w-full sm:w-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Nouvelle Simulation</span>
        </button>
      </div>
    </div>
  );
};
