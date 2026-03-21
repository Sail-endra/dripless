'use client';

import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import LoadingState from '../components/LoadingState';
import OutfitResults from '../components/OutfitResults';

type AppState = 'capture' | 'loading' | 'results' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('capture');
  const [resultData, setResultData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageCapture = async (base64String: string) => {
    setAppState('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64String }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outfit');
      }

      setResultData(data);
      setAppState('results');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setAppState('capture');
    }
  };

  const handleReset = () => {
    setResultData(null);
    setAppState('capture');
    setErrorMessage('');
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-200">
      <div className="max-w-screen-md mx-auto">
        {/* Navigation / Header */}
        <header className="p-4 flex items-center justify-between border-b border-zinc-100">
            <div className="font-bold text-xl tracking-tighter cursor-pointer" onClick={handleReset}>
               OUTFIT<span className="text-zinc-400">Gen</span>
            </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="py-8">
            {appState === 'capture' && (
                <>
                    <CameraCapture onImageCapture={handleImageCapture} />
                    {errorMessage && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center max-w-md mx-auto font-medium">
                            {errorMessage}
                        </div>
                    )}
                </>
            )}

            {appState === 'loading' && (
                <LoadingState />
            )}

            {appState === 'results' && resultData && (
                <OutfitResults 
                    outfitImageUrl={resultData.outfitImageUrl}
                    identifiedItem={resultData.identifiedItem}
                    suggestedOutfit={resultData.suggestedOutfit}
                    onReset={handleReset}
                />
            )}
        </div>
      </div>
    </main>
  );
}
