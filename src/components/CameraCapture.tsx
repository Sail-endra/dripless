'use client';

import { useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function CameraCapture({ onImageCapture }: { onImageCapture: (base64: string) => void }) {
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      onImageCapture(base64String);
    };
    reader.onerror = () => {
        setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4 w-full">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-zinc-100 rounded-full mb-2">
            <Camera className="w-6 h-6 text-zinc-900" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500">
          Scan your item
        </h1>
        <p className="text-zinc-500 max-w-sm mx-auto text-lg">
          Upload a photo of a clothing piece and we'll style a sustainable outfit around it.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-4">
        <label className="flex-1 cursor-pointer group">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col items-center justify-center py-6 px-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Camera className="w-7 h-7 mb-2" />
                <span className="font-semibold">Open Camera</span>
            </div>
        </label>
        
        <label className="flex-1 cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col items-center justify-center py-6 px-4 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95">
                <ImageIcon className="w-7 h-7 mb-2" />
                <span className="font-semibold">Upload Photo</span>
            </div>
        </label>
      </div>
      {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
    </div>
  );
}
