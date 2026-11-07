import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Key, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !accessCode.trim()) {
      setError('Ingresa tu usuario y código de acceso');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await login(username, accessCode);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] flex items-center justify-center p-4 sm:p-6 selection:bg-gold-500 selection:text-black">
      
      {/* Background Subtle Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-gold-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Modern Minimalist Login Card */}
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] bg-[#0E1015]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col items-center">
        
        {/* Clean Logo without box or borders */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-5 flex items-center justify-center">
          <img
            src="/sesion.png"
            alt="Ballon d'Or"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(197,168,105,0.15)]"
          />
        </div>

        {/* Minimalist Brand Title */}
        <div className="text-center mb-7">
          <h1 className="font-brand font-light text-xl sm:text-2xl text-white tracking-[0.24em] uppercase">
            BALLON D'OR
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold-500 font-medium mt-1">
            Gala Futsal
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Modern Clean Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-gold-500/70 focus:bg-white/[0.05] focus:outline-none text-white text-sm placeholder-gray-500 transition-all"
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              autoCapitalize="characters"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Código de acceso"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-gold-500/70 focus:bg-white/[0.05] focus:outline-none text-white text-sm placeholder-gray-500 transition-all font-mono tracking-wider uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 active:scale-[0.98] text-black font-brand font-semibold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-1.5 shadow disabled:opacity-40"
          >
            <span>{loading ? 'Verificando...' : 'Ingresar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
