import { motion } from 'motion/react';
import { Ghost, Cat, Sparkles, Frown, Smile } from 'lucide-react';
import { cn } from '../lib/utils';

export function Pet({ health }: { health: number }) {
  const isHappy = health > 70;
  const isSad = health < 30;

  return (
    <div className="relative">
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: isHappy ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          "w-48 h-48 border-8 border-[#252330] flex items-center justify-center relative z-10",
          isHappy ? "bg-amber-400" : isSad ? "bg-[#3B3A4A]" : "bg-[#575669]"
        )}
      >
        {isHappy ? (
           <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
             <Cat className="w-24 h-24 text-[#252330]" />
           </motion.div>
        ) : (
           <Cat className={cn("w-24 h-24", isSad ? "text-white/30" : "text-white/80")} />
        )}

        {/* Emotions */}
        <div className="absolute -top-4 -right-4">
           {isHappy && (
             <motion.div 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               className="bg-white p-2 border-4 border-[#252330]"
             >
               <Smile className="w-8 h-8 text-emerald-600" />
             </motion.div>
           )}
           {isSad && (
             <motion.div 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               className="bg-rose-500 text-white p-2 border-4 border-[#252330]"
             >
               <Frown className="w-8 h-8" />
             </motion.div>
           )}
        </div>
      </motion.div>

      {/* Floating Indicator */}
      <motion.div
        animate={{
          scale: [1, 0.9, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-4 border-2 border-dashed border-[#252330]"
      />

      {/* Background elements */}
      <AnimatePresence>
        {isHappy && (
          <>
            <Particle x="-40px" y="0px" delay={0} />
            <Particle x="40px" y="-40px" delay={0.5} />
            <Particle x="0px" y="-80px" delay={1} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';

function Particle({ x, y, delay }: { x: string, y: string, delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0], 
        y: [0, -100], 
        x: [0, 20],
        opacity: [0, 1, 0] 
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeOut"
      }}
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{ marginLeft: x, marginTop: y }}
    >
      <Sparkles className="w-5 h-5 text-amber-300" fill="currentColor" />
    </motion.div>
  );
}
