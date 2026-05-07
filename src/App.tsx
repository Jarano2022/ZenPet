/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { AuthView } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserStats } from './types';
import { Loader2 } from 'lucide-react';
import { Tutorial } from './components/Tutorial';
import { updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  const completeTutorial = async () => {
    if (!user || !userStats) return;
    
    // Optimistic update
    setUserStats({ ...userStats, hasCompletedTutorial: true });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        hasCompletedTutorial: true,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving tutorial completion:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setUserStats(null);
      setStatsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    // Subscribe to user stats
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserStats(docSnap.data() as UserStats);
      } else {
        // Create initial stats if new user
        const initialStats: any = {
          uid: user.uid,
          displayName: user.displayName || 'Estudiante Zen',
          email: user.email || '',
          photoURL: user.photoURL || '',
          studyHours: 0,
          socialMediaMinutes: 0,
          petHealth: 100,
          xp: 0,
          level: 1,
          inventory: [],
          achievements: [],
          isAdmin: false,
          hasCompletedTutorial: false,
          coins: 100, // Initial coins
          potions: {
            health: 1,
            mana: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        setDoc(userDocRef, initialStats).catch(err => 
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`)
        );
      }
      setStatsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#F5F9F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-8 border-[#252330] border-t-amber-400 animate-spin" />
          <p className="font-black text-xs uppercase tracking-[0.3em] text-[#252330]">SISTEMA CARGANDO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F9F8] flex items-center justify-center p-6">
        <div className="bg-rose-500 p-8 border-8 border-[#252330] text-white max-w-md w-full">
          <h2 className="text-2xl font-black mb-4 uppercase italic">CRITICAL_AUTH_ERROR</h2>
          <p className="font-mono text-xs mb-6 bg-black/20 p-4 border-2 border-white/20">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-rose-500 py-3 border-4 border-[#252330] font-black uppercase italic"
          >
            REBOOT SYSTEM
          </button>
        </div>
      </div>
    );
  }

  if (!user || !userStats) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen relative text-[#252330] overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]"
          poster="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Gradients to improve legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#F5F9F8] via-[#F5F9F8]/80 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen">
        {!userStats.hasCompletedTutorial && (
          <Tutorial onComplete={completeTutorial} />
        )}
        
        {view === 'admin' && userStats.isAdmin ? (
          <AdminPanel onExit={() => setView('dashboard')} />
        ) : (
          <Dashboard 
            userStats={userStats} 
            onOpenAdmin={() => setView('admin')} 
          />
        )}
      </div>
    </div>
  );
}
