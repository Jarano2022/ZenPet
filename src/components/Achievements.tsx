import { motion } from 'motion/react';
import { X, Trophy, Lock, CheckCircle2, Star, BadgeCheck } from 'lucide-react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';

export function AchievementsView({ 
  userStats, 
  onClose 
}: { 
  userStats: UserStats, 
  onClose: () => void 
}) {
  const achievements = [
    { id: 'study_1', title: 'Novato de Estudio', description: 'Realiza tu primera sesión de estudio.', req: userStats.studyHours >= 1 },
    { id: 'study_10', title: 'Erudito Zen', description: 'Acumula 10 horas de estudio.', req: userStats.studyHours >= 10 },
    { id: 'health_90', title: 'Vida Plena', description: 'Mantén la salud de tu pet sobre 90%.', req: userStats.petHealth >= 90 },
    { id: 'social_detox', title: 'Desconexión Digital', description: 'Mantén el uso de redes bajo.', req: userStats.socialMediaMinutes < 60 },
    { id: 'level_5', title: 'Nivel 5 Alcanzado', description: 'Llega al nivel 5 de sabiduría.', req: userStats.level >= 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#252330]/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-[#F5F9F8] border-8 border-[#252330] overflow-hidden"
      >
        <div className="p-8 pb-4 flex items-center justify-between border-b-4 border-[#252330]">
          <h2 className="text-3xl font-black text-[#252330] flex items-center gap-3 uppercase italic tracking-tighter">
            <Trophy className="w-8 h-8 text-amber-500" />
            ARCHIVO ZEN
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 border-4 border-[#252330] flex items-center justify-center bg-white hover:bg-rose-500 hover:text-white transition-all active:translate-y-[2px]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide bg-[radial-gradient(#252330_1px,transparent_1px)] [background-size:20px_20px] bg-opacity-5">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={cn(
                "p-5 border-4 border-[#252330] flex items-center gap-5 transition-all",
                ach.req ? "bg-white" : "bg-white/40 grayscale opacity-40 border-dashed"
              )}
            >
              <div className={cn(
                "w-14 h-14 border-2 border-[#252330] flex items-center justify-center shrink-0",
                ach.req ? "bg-emerald-500 text-white" : "bg-[#F5F9F8] text-[#A1A2AB]"
              )}>
                {ach.req ? <BadgeCheck className="w-8 h-8" /> : <Lock className="w-7 h-7" />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-black uppercase italic tracking-tighter text-[#252330] leading-none">{ach.title}</h4>
                <p className="text-[10px] text-[#3B3A4A] font-bold uppercase mt-2 opacity-70 tracking-widest leading-tight">{ach.description}</p>
              </div>

              {ach.req && (
                 <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="w-10 h-10 bg-amber-400 border-2 border-[#252330] flex items-center justify-center text-[#252330]"
                 >
                   <Star className="w-6 h-6" fill="currentColor" />
                 </motion.div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#3B3A4A] p-8 text-white flex items-center justify-between border-t-8 border-[#252330]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">SISTEMA STATUS</p>
              <p className="text-sm font-black uppercase italic">2 RECOMPENSAS_READY</p>
            </div>
          </div>
          <button className="bg-amber-400 text-[#252330] py-3 px-8 border-4 border-[#252330] font-black uppercase italic hover:translate-y-[-2px] transition-all">
            CANJEAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
