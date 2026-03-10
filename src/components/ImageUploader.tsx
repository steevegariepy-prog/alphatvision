import React, { useState } from 'react';
import { Camera, Upload, Image as ImageIcon, MousePointer2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, isLoading }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();
  const triggerCamera = () => cameraInputRef.current?.click();

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative bg-white rounded-[2.5rem] p-10 md:p-16 border-4 border-dashed transition-all duration-300
          ${isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' : 'border-zinc-100 bg-white hover:border-zinc-200'}
          shadow-[0_20px_50px_rgba(0,0,0,0.05)]
        `}
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
              <ImageIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-zinc-100"
            >
              <MousePointer2 className="w-4 h-4 text-zinc-900" />
            </motion.div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold font-display text-zinc-900">Prêt pour la transformation ?</h2>
            <p className="text-zinc-500 text-lg max-w-sm mx-auto">Glissez votre photo ici ou choisissez une option ci-dessous.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={triggerCamera}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-3 bg-zinc-900 text-white py-5 px-8 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-zinc-200"
            >
              <Camera className="w-5 h-5" />
              <span>Caméra</span>
            </button>
            
            <button
              onClick={triggerUpload}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-3 bg-white border-2 border-zinc-200 text-zinc-900 py-5 px-8 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Upload className="w-5 h-5" />
              <span>Galerie</span>
            </button>
          </div>

          <p className="text-zinc-400 text-sm font-medium">Format acceptés : JPG, PNG, HEIC</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
      </motion.div>
    </div>
  );
};
