import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats } from '../types';

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userData: UserStats[] = [];
      querySnapshot.forEach((doc) => {
        userData.push(doc.data() as UserStats);
      });
      setUsers(userData);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (user: UserStats) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isAdmin: !user.isAdmin
      });
      fetchUsers();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F9F8] flex flex-col font-sans">
      <header className="bg-white border-b-8 border-[#252330] px-8 py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={onExit}
            className="w-12 h-12 bg-white border-4 border-[#252330] flex items-center justify-center active:translate-y-[2px] transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-[#252330]" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#252330] flex items-center gap-3 uppercase italic leading-none tracking-tighter">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              SISTEMA CENTRAL
            </h1>
            <p className="text-[10px] text-[#A1A2AB] font-black uppercase tracking-[0.3em] mt-2 bg-[#F5F9F8] px-3 py-1 border-2 border-[#252330]/10 inline-block">MODO ADMINISTRADOR v1.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#252330]" />
              <input 
                type="text" 
                placeholder="BUSCAR USUARIOS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border-4 border-[#252330] text-xs font-black uppercase tracking-wider transition-all w-80 outline-none"
              />
           </div>
           <button 
             onClick={fetchUsers}
             className="w-14 h-14 bg-indigo-500 border-4 border-[#252330] flex items-center justify-center text-white active:translate-x-[2px] transition-all"
           >
             <Settings className="w-7 h-7" />
           </button>
        </div>
      </header>

      <main className="p-10 flex-1">
        <div className="bg-white border-8 border-[#252330] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#252330] text-white">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] italic">Entidad de Usuario</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] italic text-center">Nivel</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] italic text-center">Salud Pet</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] italic text-center">Privilegios</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] italic text-right">Protocolos</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-[#252330]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10 h-24 bg-[#F5F9F8]/50"></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 border-4 border-[#252330] bg-white overflow-hidden">
                            {user.photoURL && <img src={user.photoURL} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-black text-lg uppercase tracking-tighter italic text-[#252330] leading-none">{user.displayName}</p>
                            <p className="text-[10px] text-[#A1A2AB] font-bold uppercase mt-2">{user.email || user.uid.substring(0, 10) + '...'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-block bg-[#F5F9F8] border-2 border-[#252330] px-4 py-1">
                          <p className="text-sm font-black text-[#252330] italic">LVL {user.level}</p>
                          <p className="text-[9px] text-[#A1A2AB] font-bold uppercase">{user.xp} XP</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-32 h-4 border-2 border-[#252330] bg-white overflow-hidden p-0.5">
                              <div className="h-full bg-emerald-500 border-r-2 border-[#252330]" style={{ width: `${user.petHealth}%` }} />
                           </div>
                           <span className="text-[10px] font-black text-[#252330] uppercase">{user.petHealth}% HEALTH</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-2 border-4 border-[#252330] text-[10px] font-black uppercase italic ${
                          user.isAdmin ? 'bg-indigo-500 text-white' : 'bg-white text-[#A1A2AB]'
                        }`}>
                          {user.isAdmin ? 'MASTER_ADMIN' : 'STANDARD_USER'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button 
                          onClick={() => toggleAdmin(user)}
                          className="w-12 h-12 bg-white border-4 border-[#252330] flex items-center justify-center text-[#252330] hover:bg-indigo-50 transition-all"
                          title="MODIFICAR_PRIVILEGIOS"
                        >
                          <ShieldCheck className="w-6 h-6" />
                        </button>
                        <button 
                          className="w-12 h-12 bg-white border-4 border-[#252330] flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                          title="TERMINAR_SESION"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-[#252330]/40 font-black text-sm uppercase italic">
                      // ERROR: NO SE ENCONTRARON ENTIDADES //
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
