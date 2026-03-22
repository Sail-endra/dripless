'use client';

import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import CameraCapture from '../components/CameraCapture';
import LoadingState from '../components/LoadingState';
import OutfitResults from '../components/OutfitResults';

type AppState = 'landing' | 'capture' | 'loading' | 'results' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [resultData, setResultData] = useState<null | {
      identifiedItem: any;
      suggestedOutfit: any[];
      outfitImageUrl: string;
  }>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageCapture = async (base64String: string, options: { gender: string; season: string }) => {
    setAppState('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            imageBase64: base64String,
            gender: options.gender,
            season: options.season
        }),
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
      setAppState('error');
    }
  };

  const handleReset = () => {
    setResultData(null);
    setAppState('capture');
    setErrorMessage('');
  };

  const handleGoToLanding = () => {
    setAppState('landing');
    setResultData(null);
    setErrorMessage('');
  };

  return (
    <main className="min-h-screen bg-white text-black selection:bg-grey-light">
      {appState === 'landing' && (
        <LandingPage onStart={() => setAppState('capture')} />
      )}

      {appState === 'capture' && (
        <CameraCapture 
            onImageCapture={handleImageCapture} 
            onBack={handleGoToLanding}
        />
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

      {appState === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-beige px-6 text-center">
            <h2 className="font-display text-4xl italic mb-4">Something went wrong</h2>
            <p className="font-sans text-sm text-grey-dark mb-10 max-w-sm">{errorMessage}</p>
            <button 
                onClick={handleReset}
                className="btn-zara btn-zara-dark"
            >
                Try Again
            </button>
        </div>
      )}
    </main>
  );
}
