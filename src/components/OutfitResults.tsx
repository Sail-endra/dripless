'use client';

import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface Product {
  title: string;
  price: string;
  link: string;
  thumbnail: string;
  source: string;
  isSustainable: boolean;
}

interface OutfitResultsProps {
    outfitImageUrl: string;
    identifiedItem: any;
    suggestedOutfit: { requestedItem: any, product: Product }[];
    onReset: () => void;
}

export default function OutfitResults({ outfitImageUrl, identifiedItem, suggestedOutfit, onReset }: OutfitResultsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Generated Outfit Image */}
      <div className="w-full aspect-square relative rounded-3xl overflow-hidden shadow-2xl mb-8 bg-zinc-100">
          <img src={outfitImageUrl} alt="Generated Outfit" className="w-full h-full object-cover" />
      </div>

      <div className="space-y-2 mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Your Custom Fit</h2>
          <p className="text-zinc-500">
              Styled around your {identifiedItem?.color} {identifiedItem?.item_type}
          </p>
      </div>

      {/* Suggested Products */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4">Sourced Pieces</h3>
          {suggestedOutfit.map((item, idx) => {
              const product = item.product;
              if (!product) return null;

              return (
                  <a 
                      key={idx} 
                      href={product.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex gap-4 p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 transition-colors shadow-sm group cursor-pointer"
                  >
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-zinc-50 shrink-0">
                          {product.thumbnail && (
                              <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain p-2" />
                          )}
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                          {/* Top Row: Price + Badge */}
                          <div className="flex justify-between items-start mb-1 gap-2">
                              <span className="font-bold text-lg shrink-0">{product.price || 'Check site'}</span>
                              {product.isSustainable && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Sustainable
                                  </span>
                              )}
                          </div>
                          
                          {/* Title */}
                          <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug mb-2 group-hover:underline">
                              {product.title}
                          </p>

                          {/* Source */}
                          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-auto">
                              <span>{product.source}</span>
                              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                      </div>
                  </a>
              );
          })}
      </div>

      <div className="mt-12 flex justify-center">
          <button 
              onClick={onReset}
              className="px-8 py-4 rounded-2xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg flex items-center gap-2"
          >
              Start Over
          </button>
      </div>
    </div>
  );
}
