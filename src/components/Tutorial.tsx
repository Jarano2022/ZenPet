import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Heart, 
  Smartphone, 
  Trophy, 
  ArrowRight, 
  CheckCircle2,
  X
} from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: TutorialStep[] = [
  {
    title: "¡Bienvenido a ZenPet!",
    description: "ZenPet es tu compañero para equilibrar tu vida digital y tus estudios. Tu mascota virtual refleja tus hábitos reales.",
    icon: <Sparkles className="w-12 h-12 text-amber-500" />,
    color: "bg-amber-50"
  },
  {
    title: "Cuida a tu Mascota",
    description: "La salud de tu ZenPet depende de tu enfoque. Estudiar fortalece a tu mascota, mientras que el exceso de redes sociales la debilita.",
    icon: <Heart className="w-12 h-12 text-rose-500" fill="currentColor" />,
    color: "bg-rose-50"
  },
  {
    title: "Registra tus Hábitos",
    description: "Cada sesión de estudio suma horas y mejora la salud del pet. Registrar el uso de redes sociales te ayuda a ser consciente de tu tiempo.",
    icon: <BookOpen className="w-12 h-12 text-indigo-500" />,
    color: "bg-indigo-50"
  },
  {
    title: "Sube de Nivel",
    description: "Gana XP con cada acción positiva. Desbloquea logros y haz que tu ZenPet crezca contigo a medida que mejoras tu disciplina.",
    icon: <Trophy className="w-12 h-12 text-yellow-600" />,
    color: "bg-yellow-50"
  }
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#252330]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-lg bg-white border-8 border-[#252330] overflow-hidden relative"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-3 flex gap-0 p-0 border-b-4 border-[#252330]">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full transition-all duration-300 border-r-2 last:border-r-0 border-[#252330] ${idx <= currentStep ? 'bg-amber-400 flex-1' : 'bg-white w-8'}`}
            />
          ))}
        </div>

        <button 
          onClick={onComplete}
          className="absolute top-8 right-8 p-2 border-2 border-[#252330] hover:bg-[#F5F9F8] text-[#252330] transition-colors active:translate-y-[2px]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-12 pt-20 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full"
            >
              <div className={`w-28 h-28 border-4 border-[#252330] flex items-center justify-center mb-10 ${steps[currentStep].color}`}>
                {steps[currentStep].icon}
              </div>
              
              <h2 className="text-3xl font-black text-[#252330] mb-6 tracking-tighter uppercase italic leading-none border-b-4 border-amber-400 pb-2">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-sm text-[#575669] font-bold leading-relaxed opacity-90 max-w-xs uppercase">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 w-full">
            <button 
              onClick={nextStep}
              className="w-full bg-[#3B3A4A] text-white py-6 border-4 border-[#252330] font-black flex items-center justify-center gap-4 hover:bg-[#252330] transition-all transform active:translate-y-[4px] uppercase italic text-xl"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  EJECUTAR PROGRAMA
                </>
              ) : (
                <>
                  CONTINUAR
                  <ArrowRight className="w-8 h-8" />
                </>
              )}
            </button>
            
            <p className="mt-8 text-[10px] font-black text-[#252330] uppercase tracking-[0.2em] bg-[#F5F9F8] px-4 py-1 border-2 border-[#252330] inline-block">
              FASE {currentStep + 1} // {steps.length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
