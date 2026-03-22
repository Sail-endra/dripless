'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAST_FASHION_FACTS = [
  'The fashion industry produces 10% of global carbon emissions',
  'A single polyester shirt takes 200 years to decompose',
  'Only 1% of clothing is recycled into new clothing',
  'The average person buys 60% more clothes than 15 years ago',
  'Fast fashion produces 20% of global wastewater',
  '85% of textiles end up in landfills each year',
  'It takes 2,700 liters of water to make one cotton t-shirt',
  'Washing synthetic clothes releases 500,000 tons of microplastics yearly',
];

export default function LoadingState() {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FAST_FASHION_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-beige px-6 text-center animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="mb-12 relative h-1 w-full bg-grey-light overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-black"
          />
        </div>

        <h2 className="font-display text-4xl italic mb-8">Building your outfit...</h2>
        
        <div className="min-h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.p
                    key={factIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-sans text-sm tracking-wide text-grey-dark max-w-sm leading-relaxed"
                >
                    {FAST_FASHION_FACTS[factIndex]}
                </motion.p>
            </AnimatePresence>
        </div>

        <div className="mt-16 flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-black rounded-full"
                />
            ))}
        </div>
      </div>
    </div>
  );
}
