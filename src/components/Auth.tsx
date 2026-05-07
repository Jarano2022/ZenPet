import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInAnonymously, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider } from '../lib/firebase';
import { LogIn, Phone, Mail, Chrome, Apple, Facebook, ArrowRight, Smartphone, X, Key, UserPlus, Send, ShieldCheck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function AuthView() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'main' | 'phone' | 'email'>('main');

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('+34');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [usePassword, setUsePassword] = useState(true);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  const COUNTRIES = [
    { name: 'España', code: '+34', flag: '🇪🇸' },
    { name: 'México', code: '+52', flag: '🇲🇽' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Estados Unidos', code: '+1', flag: '🇺🇸' },
    { name: 'Reino Unido', code: '+44', flag: '🇬🇧' },
  ];

  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  useEffect(() => {
    // Verificar si el usuario viene de un enlace de correo
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        // Si no está en storage, pedírselo al usuario (fallback)
        emailForSignIn = window.prompt('Por favor, confirma tu correo electrónico para completar el acceso:');
      }
      
      if (emailForSignIn) {
        setLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
            setAuthError("Error al completar el acceso con el enlace: " + error.message);
          })
          .finally(() => setLoading(false));
      }
    }

    // Inicializar RecaptchaVerifier
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleAuth = async (providerFn: () => Promise<any>) => {
    setAuthError(null);
    setLoading(true);
    try {
      await providerFn();
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Este método de acceso no está habilitado en la consola de Firebase.");
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError("El navegador bloqueó la ventana emergente de inicio de sesión.");
      } else if (err.code === 'auth/invalid-email') {
        setAuthError("El correo electrónico no es válido.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError("Este correo ya está en uso por otra cuenta.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("La contraseña debe ser más fuerte (mínimo 6 caracteres).");
      } else {
        setAuthError(err.message || "Ocurrió un error inesperado al intentar acceder.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 3.B: Enviar el código SMS
  const onSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setAuthError(null);
    setLoading(true);
    
    const appVerifier = window.recaptchaVerifier;
    const fullNumber = `${selectedCountry}${phoneNumber.replace(/\s+/g, '')}`;

    try {
      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
    } catch (error: any) {
      console.error("Error al enviar SMS", error);
      if (error.code === 'auth/invalid-phone-number') {
        setAuthError("El número de teléfono no es válido. Verifica el número e intenta de nuevo.");
      } else {
        setAuthError("Error al enviar el código. Verifica tu conexión o el número.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 3.C: Verificar el código recibido
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !verificationCode) return;
    
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
    } catch (error) {
      setAuthError("Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  // Autenticación por correo
  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (usePassword) {
      if (!password) return;
      handleAuth(() => 
        isRegistering 
          ? createUserWithEmailAndPassword(auth, email, password)
          : signInWithEmailAndPassword(auth, email, password)
      );
    } else {
      // Método sin contraseña (Email Link)
      setLoading(true);
      setAuthError(null);
      
      const actionCodeSettings = {
        url: window.location.href, // La URL de vuelta
        handleCodeInApp: true,
      };

      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        setEmailLinkSent(true);
      } catch (error: any) {
        console.error("Error al enviar enlace mágico", error);
        setAuthError("No se pudo enviar el enlace. Verifica el correo e intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9F8] flex flex-col items-center justify-center p-6 text-[#3B3A4A]">
      {/* Contenedor para reCAPTCHA obligatorio */}
      <div id="recaptcha-container"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border-8 border-[#252330] p-10 relative overflow-hidden"
      >
        <div className="flex flex-col items-center mb-10 border-b-4 border-[#252330] pb-6">
          <motion.div 
            layout
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-20 h-20 bg-[#252330] border-4 border-amber-400 flex items-center justify-center mb-6 text-white"
          >
             {view === 'phone' ? <Smartphone className="w-10 h-10" /> : view === 'email' ? <Mail className="w-10 h-10" /> : <LogIn className="w-10 h-10" />}
          </motion.div>
          <h1 className="text-5xl font-black text-[#252330] tracking-tighter italic uppercase underline decoration-amber-400 decoration-8 underline-offset-8">ZenPet</h1>
          <p className="text-[#252330] text-center mt-8 font-black uppercase tracking-[0.2em] text-[10px] bg-[#F5F9F8] px-4 py-1 border-2 border-[#252330]">
            {view === 'phone' ? "// SMS TERMINAL //" : view === 'email' ? (emailLinkSent ? "// EMAIL SENT //" : (isRegistering ? "// NEW USER //" : "// ACCESS //")) : "// READY TO FOCUS //"}
          </p>
        </div>

        {authError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 bg-rose-500 text-white border-4 border-[#252330] text-[10px] font-black uppercase italic text-center"
          >
            !! ERROR: {authError}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {view === 'phone' ? (
            <motion.div 
              key="phone-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {!confirmationResult ? (
                <form onSubmit={onSignInSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A1A2AB] uppercase tracking-widest ml-1">Región y Teléfono</label>
                    <div className="flex gap-0 relative">
                      <div className="w-1/3">
                        <button 
                          type="button"
                          onClick={() => setShowCountrySelector(!showCountrySelector)}
                          className="w-full h-full py-4 px-4 bg-white border-4 border-[#252330] flex items-center justify-between font-black text-sm cursor-pointer hover:bg-amber-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl leading-none">{selectedCountryData.flag}</span>
                            <span>{selectedCountryData.code}</span>
                          </span>
                          <ChevronDown className={cn("w-5 h-5 text-[#252330] transition-transform", showCountrySelector && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                          {showCountrySelector && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 w-64 bg-white border-4 border-[#252330] z-50 mt-2 max-h-60 overflow-y-auto"
                            >
                              {COUNTRIES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c.code);
                                    setShowCountrySelector(false);
                                  }}
                                  className={cn(
                                    "w-full p-4 flex items-center justify-between hover:bg-amber-50 border-b-2 border-[#252330]/10 last:border-0 transition-all",
                                    selectedCountry === c.code && "bg-[#F5F9F8]"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{c.flag}</span>
                                    <div className="text-left">
                                      <p className="text-[10px] font-black uppercase text-[#A1A2AB] tracking-widest">{c.name}</p>
                                      <p className="font-black text-sm">{c.code}</p>
                                    </div>
                                  </div>
                                  {selectedCountry === c.code && <div className="w-2 h-2 bg-[#252330] rounded-full" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <input 
                        type="tel" 
                        placeholder="600 000 000" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 py-4 px-6 bg-white border-4 border-l-0 border-[#252330] outline-none transition-all font-black text-lg placeholder:opacity-30 focus:bg-amber-50"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3B3A4A] text-white py-5 border-4 border-[#252330] font-black flex items-center justify-center gap-4 hover:bg-[#252330] transition-all active:translate-y-[2px] uppercase italic"
                  >
                    {loading ? "ENVIANDO..." : "ENVIAR CÓDIGO SMS"}
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A1A2AB] uppercase tracking-widest ml-1">Código de verificación</label>
                    <input 
                      type="text" 
                      placeholder="000000" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full py-6 px-6 bg-white border-4 border-[#252330] outline-none focus:bg-emerald-50 transition-all font-black text-3xl tracking-[0.6em] text-center"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 text-[#252330] py-6 border-4 border-[#252330] font-black flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:translate-y-[2px] uppercase italic"
                  >
                    {loading ? "VERIFICANDO..." : "CONFIRMAR CÓDIGO"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setConfirmationResult(null)}
                    className="w-full text-xs text-[#A1A2AB] font-bold py-2"
                  >
                    ¿Número incorrecto? Volver atrás
                  </button>
                </form>
              )}
              
              <button 
                onClick={() => { setView('main'); setConfirmationResult(null); }}
                className="w-full flex items-center justify-center gap-2 py-2 text-[#A1A2AB] font-bold text-sm hover:text-[#3B3A4A] transition-colors"
              >
                Volver a otros métodos
              </button>
            </motion.div>
          ) : view === 'email' ? (
            <motion.div 
              key="email-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {emailLinkSent ? (
                <div className="flex flex-col items-center text-center space-y-6 pt-4">
                  <div className="w-20 h-20 bg-emerald-100/50 rounded-full flex items-center justify-center">
                    <Send className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-xl text-[#252330]">¡Enlace enviado!</h3>
                    <p className="text-sm text-[#575669] font-medium leading-relaxed">
                      Hemos enviado un enlace de acceso mágico a <span className="font-bold text-[#252330]">{email}</span>.
                      Haz clic en él para entrar automáticamente.
                    </p>
                  </div>
                  <button 
                    onClick={() => setEmailLinkSent(false)}
                    className="text-xs font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-6 py-3 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Intentar con otro método
                  </button>
                </div>
              ) : (
                <form onSubmit={onEmailSubmit} className="space-y-6">
                  <div className="flex p-1 bg-[#F5F9F8] border-2 border-[#252330] mb-4">
                    <button 
                      type="button"
                      onClick={() => { setUsePassword(true); setAuthError(null); }}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${usePassword ? 'bg-[#3B3A4A] text-white' : 'text-[#A1A2AB]'}`}
                    >
                      SISTEMA PASS
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setUsePassword(false); setAuthError(null); }}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${!usePassword ? 'bg-[#3B3A4A] text-white' : 'text-[#A1A2AB]'}`}
                    >
                      SIN TOKEN
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#252330] uppercase tracking-widest ml-1">ENTRADA: EMAIL</label>
                      <input 
                        type="email" 
                        placeholder="USER@ZENPET.IO" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-5 px-6 bg-white border-4 border-[#252330] outline-none transition-all font-black text-sm uppercase placeholder:opacity-30 focus:bg-amber-50"
                        required
                      />
                    </div>
                    {usePassword && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#252330] uppercase tracking-widest ml-1">ENTRADA: PASSWORD</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-5 px-6 bg-white border-4 border-[#252330] outline-none transition-all font-black text-sm placeholder:opacity-30 focus:bg-amber-50"
                          required
                        />
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3B3A4A] text-white py-6 border-4 border-[#252330] font-black flex items-center justify-center gap-4 hover:bg-[#252330] transition-all active:translate-y-[2px] uppercase italic"
                  >
                    {!usePassword ? (
                      <>
                        <Send className="w-6 h-6 text-amber-400" />
                        {loading ? "ENVIANDO..." : "ENVIAR ENLACE"}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        {loading ? "CARGANDO..." : (isRegistering ? "CREAR CUENTA" : "ENTRAR")}
                      </>
                    )}
                  </button>
                </form>
              )}
              
              {!emailLinkSent && (
                <div className="flex flex-col gap-3 pt-2 text-center">
                  {usePassword && (
                    <button 
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-xs font-bold text-[#595168] hover:underline"
                    >
                      {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate gratis"}
                    </button>
                  )}
                  <button 
                    onClick={() => setView('main')}
                    className="w-full text-xs text-[#A1A2AB] font-bold py-2 hover:text-[#595168] transition-colors"
                  >
                    Cancelar y volver
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="main-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setView('phone')}
                className="w-full flex items-center justify-between p-6 bg-white border-4 border-[#252330] hover:bg-[#F5F9F8] transition-all group active:translate-y-[2px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400 border-2 border-[#252330] flex items-center justify-center text-[#252330]">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="font-black italic uppercase tracking-tighter">CÓDIGO SMS</p>
                    <p className="text-[10px] text-[#A1A2AB] font-bold uppercase">ACCESO RÁPIDO</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-[#252330] group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setView('email')}
                className="w-full flex items-center justify-between p-6 bg-white border-4 border-[#252330] hover:bg-[#F5F9F8] transition-all group active:translate-y-[2px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 border-2 border-[#252330] flex items-center justify-center text-white">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="font-black italic uppercase tracking-tighter">CORREO ZEN</p>
                    <p className="text-[10px] text-[#A1A2AB] font-bold uppercase">ENLACE MÁGICO</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-[#252330] group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-6 border-t-2 border-dashed border-[#252330]/20">
                <p className="text-center text-[10px] font-black text-[#A1A2AB] uppercase tracking-widest mb-6">--- OTRAS CONEXIONES ---</p>
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={() => handleAuth(() => signInWithPopup(auth, googleProvider))}
                    className="w-16 h-16 bg-white border-4 border-[#252330] flex items-center justify-center active:translate-x-[2px] transition-all"
                  >
                    <Chrome className="w-8 h-8 text-rose-500" />
                  </button>
                  <button 
                    onClick={() => handleAuth(() => signInWithPopup(auth, appleProvider))}
                    className="w-16 h-16 bg-white border-4 border-[#252330] flex items-center justify-center active:translate-x-[2px] transition-all"
                  >
                    <Apple className="w-8 h-8 text-[#252330]" />
                  </button>
                  <button 
                    onClick={() => handleAuth(() => signInWithPopup(auth, facebookProvider))}
                    className="w-16 h-16 bg-white border-4 border-[#252330] flex items-center justify-center active:translate-x-[2px] transition-all"
                  >
                    <Facebook className="w-8 h-8 text-indigo-600" />
                  </button>
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#A1A2AB]/20"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="bg-white px-3 text-[#A1A2AB]">Acceso Rápido</span>
                </div>
              </div>

              <button 
                onClick={() => handleAuth(() => signInAnonymously(auth))}
                disabled={loading}
                className="w-full py-4 text-sm text-[#A1A2AB] hover:text-[#252330] transition-colors font-bold underline decoration-[#A1A2AB]/30 underline-offset-4 uppercase tracking-tighter"
              >
                ENTRAR COMO INVITADO
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <p className="mt-8 text-xs text-[#A1A2AB] max-w-sm text-center font-medium opacity-60">
        Al unirte, aceptas transformar tus hábitos de estudio en salud para tu compañero virtual.
      </p>
    </div>
  );
}

function AuthButton({ 
  icon, 
  label, 
  onClick, 
  disabled,
  className 
}: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void,
  disabled?: boolean,
  className?: string
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      {label}
    </button>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
