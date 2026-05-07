import React, { useState } from 'react';
import { UserStats } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { 
  BookOpen, 
  Clock, 
  Heart, 
  Trophy, 
  LogOut, 
  Plus, 
  Minus,
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  Zap,
  Coins,
  FlaskConical,
  ShoppingCart,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Pet } from './Pet';
import { AchievementsView } from './Achievements';
import { Settings } from './Settings';

export function Dashboard({ 
  userStats, 
  onOpenAdmin 
}: { 
  userStats: UserStats, 
  onOpenAdmin: () => void 
}) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studySeconds, setStudySeconds] = useState(0);
  const [distractionWarning, setDistractionWarning] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Focus Detection
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStudying) {
      interval = setInterval(() => {
        setStudySeconds(s => s + 1);
      }, 1000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          handleDistraction();
        }
      };

      const handleBlur = () => {
        handleDistraction();
      };

      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);

      return () => {
        clearInterval(interval);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [isStudying]);

  const handleDistraction = async () => {
    if (!isStudying) return;
    
    setIsStudying(false);
    setDistractionWarning(true);
    
    try {
      const userRef = doc(db, 'users', userStats.uid);
      await updateDoc(userRef, {
        petHealth: Math.max(0, userStats.petHealth - 5),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error al penalizar distracción", err);
    }
    
    setTimeout(() => setDistractionWarning(false), 5000);
  };

  const handleStudyToggle = async () => {
    if (isStudying) {
      // End session
      setIsStudying(false);
      setActionLoading(true);
      try {
        const userRef = doc(db, 'users', userStats.uid);
        const hoursGained = studySeconds / 3600;
        const xpGain = Math.floor(studySeconds / 10); // 1 XP cada 10 seg
        const healthGain = Math.floor(studySeconds / 60); // 1 Salud cada min
        const coinsGain = Math.floor(studySeconds / 20); // 1 Moneda cada 20 seg
        
        await updateDoc(userRef, {
          studyHours: increment(Number(hoursGained.toFixed(2))),
          petHealth: Math.min(100, userStats.petHealth + healthGain),
          xp: userStats.xp + xpGain,
          coins: increment(coinsGain),
          level: Math.floor((userStats.xp + xpGain) / 500) + 1,
          updatedAt: serverTimestamp()
        });
        setStudySeconds(0);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userStats.uid}`);
      } finally {
        setActionLoading(false);
      }
    } else {
      setIsStudying(true);
    }
  };

  const usePotion = async (type: 'health' | 'mana') => {
    if (userStats.potions[type] <= 0) return;
    setActionLoading(true);
    try {
      const userRef = doc(db, 'users', userStats.uid);
      const updates: any = {
        [`potions.${type}`]: increment(-1),
        updatedAt: serverTimestamp()
      };
      
      if (type === 'health') {
        updates.petHealth = Math.min(100, userStats.petHealth + 30);
      }
      
      await updateDoc(userRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userStats.uid}`);
    } finally {
      setActionLoading(false);
    }
  };

  const buyPotion = async (type: 'health' | 'mana') => {
    const cost = 50;
    if (userStats.coins < cost) return;
    setActionLoading(true);
    try {
      const userRef = doc(db, 'users', userStats.uid);
      await updateDoc(userRef, {
        coins: increment(-cost),
        [`potions.${type}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userStats.uid}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSocialMedia = async () => {
    setActionLoading(true);
    try {
      const userRef = doc(db, 'users', userStats.uid);
      const healthLoss = 5;
      
      await updateDoc(userRef, {
        socialMediaMinutes: increment(15),
        petHealth: Math.max(0, userStats.petHealth - healthLoss),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userStats.uid}`);
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 bg-white border-4 border-[#252330] p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#3B3A4A] border-4 border-[#252330] flex items-center justify-center text-white relative">
            {userStats.photoURL ? (
              <img src={userStats.photoURL} alt={userStats.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-8 h-8 text-white" />
            )}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-[#252330] px-2 py-0.5 text-[8px] font-black text-white uppercase italic">Ready</div>
          </div>
          <div>
            <h2 className="font-black text-xl text-[#252330] uppercase italic leading-none">{userStats.displayName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] bg-[#3B3A4A] text-white px-2 py-0.5 font-black uppercase italic">Nivel {userStats.level}</span>
              <div className="flex items-center gap-1 bg-amber-400 border-2 border-[#252330] px-2 py-0.5 text-[#252330] font-black text-[10px]">
                <Coins className="w-3 h-3" />
                {userStats.coins || 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {userStats.isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="p-3 bg-white border-2 border-[#252330] hover:bg-[#F5F9F8] active:translate-y-[2px] transition-all"
              title="Panel de Admin"
            >
              <ShieldCheck className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white border-2 border-[#252330] hover:bg-[#F5F9F8] active:translate-y-[2px] transition-all"
            title="Configuración"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="p-3 bg-[#3B3A4A] text-white border-2 border-[#252330] active:translate-y-[2px] transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left: Pet Interaction */}
        <section className="bg-white/90 backdrop-blur-md p-8 border-4 border-[#252330] flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-8 relative z-10 border-b-2 border-[#252330]/10 pb-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#252330] uppercase">
                <Heart className={cn("w-5 h-5", userStats.petHealth < 30 ? "text-red-500 animate-pulse" : "text-rose-500")} fill="currentColor" />
                Vida del Pet
              </div>
              <div className="w-48 h-6 bg-[#F5F9F8] border-2 border-[#252330] relative">
                <motion.div 
                  className={cn(
                    "h-full",
                    userStats.petHealth > 70 ? "bg-emerald-400" :
                    userStats.petHealth > 30 ? "bg-amber-400" : "bg-red-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.petHealth}%` }}
                />
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs font-black text-[#252330] uppercase justify-end mb-1">
                 XP
                <Zap className="w-4 h-4 text-amber-500" fill="currentColor" />
              </div>
              <p className="text-[10px] font-black text-[#A1A2AB] tracking-widest">{userStats.xp} / {(userStats.level * 500)}</p>
            </div>
          </div>

          <div className="py-12 relative w-full flex justify-center z-10">
             <Pet health={userStats.petHealth} />
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mt-8 relative z-10">
            <StatCard 
              icon={<BookOpen className="w-5 h-5 text-indigo-500" />}
              label="Estudio"
              value={`${userStats.studyHours}h`}
              bgColor="bg-white border-2 border-[#252330]"
            />
            <StatCard 
              icon={<Clock className="w-5 h-5 text-rose-500" />}
              label="Redes"
              value={`${userStats.socialMediaMinutes}m`}
              bgColor="bg-white border-2 border-[#252330]"
            />
          </div>

          {/* User Potions Section */}
          <div className="w-full mt-10 pt-10 border-t-4 border-[#252330] relative z-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#252330] mb-6 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Inventario de Pociones
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={() => usePotion('health')}
                disabled={actionLoading || (userStats.potions?.health || 0) <= 0 || userStats.petHealth >= 100}
                className="flex-1 bg-white border-2 border-[#252330] p-4 flex items-center justify-between group disabled:opacity-30 transition-all active:translate-y-[2px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 border-2 border-[#252330] flex items-center justify-center text-white">
                    <FlaskConical className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-[#252330]">Salud</p>
                    <p className="text-xs font-black text-[#A1A2AB]">CANT: {userStats.potions?.health || 0}</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-[#252330] group-hover:scale-125 transition-transform" />
              </button>
              
              <button 
                onClick={() => setShowShop(!showShop)}
                className="w-16 h-16 bg-[#3B3A4A] text-white border-2 border-[#252330] flex items-center justify-center active:translate-y-[2px] transition-all"
              >
                <ShoppingCart className={cn("w-8 h-8 transition-transform", showShop && "rotate-12")} />
              </button>
            </div>

            <AnimatePresence>
              {showShop && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-6 p-6 bg-amber-50 border-4 border-[#252330]"
                >
                  <div className="flex items-center justify-between mb-6 border-b-2 border-[#252330]/10 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#252330]">Mercado Negro Zen</h4>
                    <div className="flex items-center gap-1 text-xs font-black text-amber-700">
                      <Coins className="w-4 h-4" />
                      {userStats.coins}
                    </div>
                  </div>
                  <button 
                    onClick={() => buyPotion('health')}
                    disabled={actionLoading || userStats.coins < 50}
                    className="w-full bg-white p-4 border-2 border-[#252330] flex items-center justify-between active:translate-y-[2px] transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-6 h-6 text-emerald-600" />
                      <span className="text-xs font-black text-[#252330] uppercase">Poción Vital</span>
                    </div>
                    <span className="text-sm font-black text-amber-700 bg-amber-100 px-3 py-1 border-2 border-[#252330]">50💰</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right: Actions & Achievements */}
        <div className="space-y-12">
          <section className="bg-[#3B3A4A] border-4 border-[#252330] p-8 text-white">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
              <Zap className="w-6 h-6 text-amber-400" />
              Misiones de Foco
            </h3>
            
            <div className="space-y-8">
              <AnimatePresence>
                {distractionWarning && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-rose-500 text-white p-5 border-4 border-[#252330] font-black text-xs text-center mb-6 uppercase italic"
                  >
                    // ALERTA // DISTRACCIÓN DETECTADA //
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleStudyToggle}
                disabled={actionLoading}
                className={cn(
                  "w-full p-8 border-4 border-[#252330] flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden group active:translate-y-[4px]",
                  isStudying ? "bg-emerald-600 text-white" : "bg-white text-[#252330]"
                )}
              >
                <div className="flex items-center gap-4 relative z-10 w-full justify-center">
                  <div className={cn(
                    "w-16 h-16 border-4 border-[#252330] flex items-center justify-center",
                    isStudying ? "bg-emerald-700" : "bg-[#F5F9F8]"
                  )}>
                    {isStudying ? <Clock className="w-8 h-8 animate-pulse" /> : <Plus className="w-10 h-10 text-emerald-600" />}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-2xl uppercase italic tracking-tighter leading-none">{isStudying ? "MODO FOCO" : "INICIAR SESIÓN"}</p>
                    <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-wide", isStudying ? "opacity-70" : "text-[#A1A2AB]")}>
                      {isStudying ? "PROTOCOLO DE BLOQUEO ACTIVO" : "1💰 CADA 20S // +XP DE ENTRENAMIENTO"}
                    </p>
                  </div>
                </div>
                
                {isStudying && (
                  <div className="mt-8 text-7xl font-black tracking-tighter font-mono relative z-10 bg-black/10 px-8 py-3 border-y-2 border-white/20">
                    {formatTime(studySeconds)}
                  </div>
                )}
              </button>

              <button 
                onClick={handleSocialMedia}
                disabled={actionLoading || isStudying}
                className="w-full bg-[#3B3A4A] border-4 border-[#252330] p-6 flex items-center justify-between group disabled:opacity-30 disabled:grayscale transition-all active:translate-y-[2px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-500 border-2 border-white/20 flex items-center justify-center text-white">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase italic text-white text-lg leading-none">REDES SOCIALES</p>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">+15m // PENALIZA SALUD PET</p>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-rose-500 transition-all" />
              </button>
            </div>
          </section>

          <section className="bg-white border-4 border-[#252330] p-8">
            <div className="flex items-center justify-between mb-8 border-b-4 border-[#252330]/10 pb-4">
              <h3 className="font-black text-xl text-[#252330] flex items-center gap-3 uppercase italic">
                <Trophy className="w-6 h-6 text-amber-500" />
                TROFEOS
              </h3>
              <button 
                onClick={() => setShowAchievements(true)}
                className="text-[10px] font-black text-indigo-600 underline uppercase tracking-[0.2em] hover:text-indigo-800"
              >
                VER ARCHIVO
              </button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {userStats.achievements?.length > 0 ? (
                userStats.achievements.slice(0, 3).map((achId) => (
                  <div key={achId} className="w-20 h-20 bg-[#F5F9F8] border-4 border-[#252330] shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                    <Trophy className="w-10 h-10 text-[#252330]" />
                  </div>
                ))
              ) : (
                <div className="text-center w-full py-12 text-[#252330]/40 font-black text-xs uppercase italic border-4 border-dashed border-[#252330]/10">
                  SIN REGISTROS DE GLORIA
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {showAchievements && (
          <AchievementsView 
            userStats={userStats} 
            onClose={() => setShowAchievements(false)} 
          />
        )}
      </AnimatePresence>

      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        userStats={userStats} 
      />
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string }) {
  return (
    <div className={cn("p-4 border-2 border-[#252330]", bgColor)}>
      <div className="mb-3">{icon}</div>
      <p className="text-[10px] font-black text-[#A1A2AB] uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-[#252330] tabular-nums leading-none italic">{value}</p>
    </div>
  );
}
