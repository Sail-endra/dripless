'use client';

import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/fashion-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-end p-10 md:p-20">
          <p className="mb-4 font-sans text-xs font-medium tracking-[4px] uppercase opacity-50 animate-fade-up">
            AI-powered fashion
          </p>
          <h1 className="mb-6 font-display text-7xl md:text-9xl leading-[0.85] tracking-tighter animate-fade-up [animation-delay:200ms]">
            DRESS <br />
            <span className="italic">DIFFERENT.</span>
          </h1>
          <p className="mb-10 max-w-sm font-sans text-sm md:text-base opacity-70 animate-fade-up [animation-delay:400ms]">
            Build complete outfits around what you own. Every suggestion is secondhand.
          </p>
          <button
            onClick={onStart}
            className="btn-zara btn-zara-light max-w-xs animate-fade-up [animation-delay:600ms]"
          >
            Scan Your Clothes
          </button>
          
          <div className="absolute bottom-10 right-10 hidden md:block opacity-80 mix-blend-screen">
            <img src="/leaf-circuit.jpg" alt="Dripless" className="h-40 object-contain" />
          </div>
          <p className="absolute bottom-10 left-10 text-[10px] tracking-[2px] uppercase opacity-30">
            Powered by GPT-4o
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-beige py-24 px-10 md:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-16 text-center font-sans text-xs font-semibold tracking-[3px] uppercase text-grey-dark">
            By the numbers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="border-b md:border-b-0 md:border-r border-grey-light pb-12 md:pb-0 px-8">
              <p className="font-display text-8xl text-red mb-4">92M</p>
              <p className="font-sans text-xs font-semibold tracking-[2px] uppercase text-grey-dark">
                Tonnes of textile waste yearly
              </p>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-grey-light pb-12 md:pb-0 px-8">
              <p className="font-display text-8xl text-red mb-4">75%</p>
              <p className="font-sans text-xs font-semibold tracking-[2px] uppercase text-grey-dark">
                Want to shop sustainably
              </p>
            </div>
            <div className="px-8">
              <p className="font-display text-8xl text-red mb-4">35%</p>
              <p className="font-sans text-xs font-semibold tracking-[2px] uppercase text-grey-dark">
                Actually do
              </p>
            </div>
          </div>
          <hr className="mt-16 border-grey-light" />
          <p className="mt-10 text-center font-display text-2xl italic text-grey-dark">
            Dripless closes that gap.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-black py-24 px-10 md:px-20 text-white">
        <div className="mx-auto max-w-7xl text-center mb-16">
          <p className="mb-6 font-sans text-xs font-medium tracking-[4px] uppercase opacity-50">
            How it works
          </p>
          <h2 className="font-display text-5xl md:text-8xl">Three steps. One outfit.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 bg-white/5 p-12 text-left">
            <p className="mb-8 font-sans text-xs font-bold text-red">01</p>
            <h3 className="mb-4 font-display text-4xl">Scan</h3>
            <p className="font-sans text-base opacity-60">
              Point your camera at any clothing item you own or are about to buy
            </p>
          </div>
          <div className="border border-white/10 bg-white/5 p-12 text-left">
            <p className="mb-8 font-sans text-xs font-bold text-red">02</p>
            <h3 className="mb-4 font-display text-4xl">Style</h3>
            <p className="font-sans text-base opacity-60">
              AI builds a complete outfit using color theory and fashion logic
            </p>
          </div>
          <div className="border border-white/10 bg-white/5 p-12 text-left">
            <p className="mb-8 font-sans text-xs font-bold text-red">03</p>
            <h3 className="mb-4 font-display text-4xl">Shop</h3>
            <p className="font-sans text-base opacity-60">
              Every suggested piece is sourced from secondhand marketplaces. Always.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black py-32 px-10 md:px-20 text-white text-center">
        <h2 className="mb-10 font-display text-7xl md:text-9xl tracking-tight">
          Your wardrobe. <br />
          Reimagined.
        </h2>
        <p className="mb-12 font-sans text-base opacity-50">
          Scan anything. Style everything. Spend less.
        </p>
        <button
          onClick={onStart}
          className="btn-zara btn-zara-red"
        >
          Start Styling
        </button>
      </section>
    </div>
  );
}
