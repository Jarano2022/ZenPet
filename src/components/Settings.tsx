import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Palette, 
  Shield, 
  Save, 
  LogOut, 
  Trash2, 
  Check,
  ChevronRight
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any;
}

export function Settings({ isOpen, onClose, userStats }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'theme'>('profile');
  const [displayName, setDisplayName] = useState(userStats.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('zen'); // Default

  const themes = [
    { id: 'zen', name: 'ZEN_DEFAULT', bg: 'bg-[#F5F9F8]', primary: 'bg-[#3B3A4A]', accent: 'bg-amber-400' },
    { id: 'cyber', name: 'CYBER_PUNK', bg: 'bg-yellow-100', primary: 'bg-black', accent: 'bg-cyan-400' },
    { id: 'brutal', name: 'BRUTAL_RED', bg: 'bg-rose-50', primary: 'bg-[#252330]', accent: 'bg-rose-600' }
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        updatedAt: new Date().toISOString()
      });
      // In a real app, this would trigger a state update via the listener in App.tsx
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#252330]/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white border-l-8 border-[#252330] flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-8 border-b-8 border-[#252330] flex items-center justify-between bg-[#F5F9F8]">
              <div>
                <h2 className="text-3xl font-black text-[#252330] uppercase italic tracking-tighter leading-none">Settings</h2>
                <p className="text-[10px] font-black text-[#A1A2AB] uppercase tracking-[0.3em] mt-2">Personalize // Protocol</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 border-4 border-[#252330] flex items-center justify-center bg-white hover:bg-rose-500 hover:text-white transition-all active:translate-y-[2px]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-20 border-r-4 border-[#252330] bg-[#F5F9F8] flex flex-col items-center py-8 gap-6">
                <TabButton 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                  icon={<User className="w-6 h-6" />}
                />
                <TabButton 
                  active={activeTab === 'theme'} 
                  onClick={() => setActiveTab('theme')}
                  icon={<Palette className="w-6 h-6" />}
                />
                <TabButton 
                  active={activeTab === 'account'} 
                  onClick={() => setActiveTab('account')}
                  icon={<Shield className="w-6 h-6" />}
                />
              </div>

              {/* Main Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'profile' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="border-b-4 border-[#252330]/10 pb-4">
                      <h3 className="text-xl font-black uppercase italic text-[#252330]">User_Profile</h3>
                      <p className="text-[10px] text-[#A1A2AB] font-bold uppercase tracking-widest mt-1">Identidad en el sistema</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#252330] uppercase tracking-widest leading-none">Nombre de Entidad</label>
                        <input 
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#F5F9F8] border-4 border-[#252330] px-4 py-4 font-black uppercase italic outline-none focus:bg-amber-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#252330] uppercase tracking-widest leading-none">Email del Sistema</label>
                        <div className="w-full bg-[#A1A2AB]/10 border-4 border-[#252330]/20 px-4 py-4 font-black uppercase italic text-[#A1A2AB]">
                          {userStats.email || 'N/A'}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#252330] text-white py-4 border-4 border-[#252330] font-black uppercase italic flex items-center justify-center gap-3 active:translate-y-[2px] transition-all"
                      >
                        <Save className="w-5 h-5 text-amber-400" />
                        {isSaving ? 'Actualizando...' : 'Guardar Cambios'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'theme' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="border-b-4 border-[#252330]/10 pb-4">
                      <h3 className="text-xl font-black uppercase italic text-[#252330]">System_Look</h3>
                      <p className="text-[10px] text-[#A1A2AB] font-bold uppercase tracking-widest mt-1">Estética visual</p>
                    </div>

                    <div className="grid gap-4">
                      {themes.map((t) => (
                        <button 
                          key={t.id}
                          onClick={() => setSelectedTheme(t.id)}
                          className={cn(
                            "w-full p-4 border-4 transition-all flex items-center justify-between group",
                            selectedTheme === t.id ? "border-[#252330] bg-[#F5F9F8]" : "border-transparent bg-white hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 border-2 border-[#252330]", t.accent)} />
                            <span className="font-black uppercase italic text-sm">{t.name}</span>
                          </div>
                          {selectedTheme === t.id && <Check className="w-6 h-6 text-[#252330]" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'account' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="border-b-4 border-[#252330]/10 pb-4">
                      <h3 className="text-xl font-black uppercase italic text-[#252330]">Account_Access</h3>
                      <p className="text-[10px] text-[#A1A2AB] font-bold uppercase tracking-widest mt-1">Seguridad y sesión</p>
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={() => auth.signOut()}
                        className="w-full bg-white border-4 border-[#252330] p-4 flex items-center justify-between group hover:bg-[#252330] hover:text-white transition-all"
                      >
                        <span className="font-black uppercase italic">Cerrar Sesión</span>
                        <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        className="w-full bg-rose-50 text-rose-600 border-4 border-rose-600 p-4 flex items-center justify-between group hover:bg-rose-600 hover:text-white transition-all mt-12"
                      >
                        <span className="font-black uppercase italic">Eliminar Entidad</span>
                        <Trash2 className="w-6 h-6" />
                      </button>
                      <p className="text-[9px] text-[#A1A2AB] font-bold uppercase text-center px-4">
                        Esta acción purgará todos tus datos de foco y progreso del pet permanentemente.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Footer Status */}
            <div className="p-4 bg-[#252330] text-white flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">ZenPet_Core: Online // v1.2</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-12 h-12 border-4 transition-all flex items-center justify-center",
        active ? "bg-[#252330] border-[#252330] text-amber-400" : "bg-white border-[#252330]/10 text-[#A1A2AB] hover:border-[#252330]/40"
      )}
    >
      {icon}
    </button>
  );
}
