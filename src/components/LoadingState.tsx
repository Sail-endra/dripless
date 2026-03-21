'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LOADING_STEPS = [
  "Analyzing your garment...",
  "Consulting the stylist...",
  "Finding sustainable matches...",
  "Generating your complete outfit...",
  "Putting on the final touches..."
];

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Reveal a new step every 3 seconds
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full max-w-md mx-auto">
      
      {/* Skeleton / Abstract loading visual */}
      <div className="w-full aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden relative shadow-sm mb-8">
         <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-50 animate-pulse" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
         </div>
      </div>

      <div className="space-y-6 w-full">
         {LOADING_STEPS.map((step, idx) => {
             const isActive = idx === stepIndex;
             const isPast = idx < stepIndex;
             const isFuture = idx > stepIndex;
             
             if (isFuture) return null;

             return (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isActive ? 1 : 0.4, y: 0 }}
                    key={step} 
                    className="flex items-center gap-4"
                 >
                     <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-zinc-900 animate-pulse' : 'bg-zinc-400'}`} />
                     <p className={`font-medium ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                         {step}
                     </p>
                 </motion.div>
             );
         })}
      </div>
    </div>
  );
}
