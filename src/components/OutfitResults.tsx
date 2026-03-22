'use client';

import { useState } from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface Product {
  title: string;
  price: string;
  link: string;
  thumbnail: string;
  source: string;
  isSustainable: boolean;
}

interface IdentifiedItem {
  color?: string;
  item_type?: string;
  brand?: string;
  style?: string;
}

interface RequestedItem {
  item: string;
  color: string;
  reason: string;
}

interface OutfitResultsProps {
    outfitImageUrl: string;
    identifiedItem: IdentifiedItem;
    suggestedOutfit: { requestedItem: RequestedItem, product: Product | null }[];
    onReset: () => void;
}

export default function OutfitResults({ outfitImageUrl, identifiedItem, suggestedOutfit, onReset }: OutfitResultsProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showGeneratedImage = Boolean(outfitImageUrl) && !imageFailed;

  return (
    <div className="w-full min-h-screen bg-beige animate-fade-in pb-20">
      
      {/* Mini Nav */}
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto w-full">
        <p className="font-sans text-xs font-semibold tracking-[3px] uppercase">Dripless</p>
        <button onClick={onReset} className="font-sans text-xs font-semibold tracking-[3px] uppercase hover:opacity-60 transition-opacity">
          ← Scan Another
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        {/* Generated Outfit Image */}
        <div className="w-full aspect-[3/4] relative mb-12 bg-white shadow-2xl overflow-hidden">
            {showGeneratedImage ? (
              <img
                src={outfitImageUrl}
                alt="Generated Outfit"
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-12 text-center text-grey-mid">
                <p className="font-display text-4xl italic mb-4">Preview unavailable</p>
                <p className="font-sans text-xs tracking-[2px] uppercase">But your styling results are ready below</p>
              </div>
            )}
        </div>

        <div className="text-left mb-16">
            <p className="font-sans text-xs font-semibold tracking-[3px] uppercase text-red mb-4">Your Outfit</p>
            <h2 className="font-display text-5xl md:text-7xl mb-6">
                Styled around your <span className="italic">{identifiedItem?.color} {identifiedItem?.item_type}</span>
            </h2>
            <div className="flex flex-wrap gap-4">
                {identifiedItem?.brand && identifiedItem.brand !== 'Unknown' && (
                    <span className="px-4 py-1.5 bg-black text-white text-[10px] tracking-[2px] uppercase">{identifiedItem.brand}</span>
                )}
                <span className="px-4 py-1.5 border border-black text-[10px] tracking-[2px] uppercase">{identifiedItem?.style || 'Casual'}</span>
            </div>
        </div>

        {/* Suggested Products */}
        <div className="space-y-12">
            <h3 className="font-sans text-xs font-semibold tracking-[3px] uppercase border-b border-grey-light pb-4">Sourced Pieces</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {suggestedOutfit.map((item, idx) => {
                    const product = item.product;
                    if (!product) return null;

                    return (
                        <a 
                            key={idx} 
                            href={product.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col group bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-square relative overflow-hidden bg-beige mb-6">
                                {product.thumbnail && (
                                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-500" />
                                )}
                                {product.isSustainable && (
                                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-[8px] tracking-[2px] uppercase flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Sustainable
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-display text-2xl italic">{item.requestedItem.item}</p>
                                    <span className="font-sans text-sm font-bold">{product.price || 'Check site'}</span>
                                </div>
                                
                                <p className="text-[11px] font-sans text-grey-dark uppercase tracking-wider line-clamp-2 leading-relaxed mb-4 group-hover:underline decoration-grey-mid underline-offset-4">
                                    {product.title}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-grey-light">
                                    <span className="text-[10px] tracking-[2px] uppercase text-grey-mid">{product.source}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
            {suggestedOutfit.every((item) => !item.product) && (
                <div className="border border-grey-light border-dashed p-12 text-center text-grey-mid">
                    <p className="font-display text-2xl italic">Product sourcing is currently unavailable</p>
                </div>
            )}
        </div>

        <div className="mt-24 flex justify-center border-t border-grey-light pt-20">
            <button 
                onClick={onReset}
                className="btn-zara btn-zara-dark"
            >
                Start Over
            </button>
        </div>
      </div>
    </div>
  );
}
