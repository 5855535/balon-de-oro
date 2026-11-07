import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Key, X, Shield, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !accessCode.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await login(username, accessCode);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (user: string, code: string) => {
    setUsername(user);
    setAccessCode(code);
    setLoading(true);
    setError(null);
    const res = await login(user, code);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md sm:max-w-xl bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header with sesion.png */}
        <div className="relative w-full h-36 sm:h-44 bg-black flex items-center justify-center overflow-hidden border-b border-white/10">
          <img
            src="/sesion.png"
            alt="Ballon d'Or Oficial"
            className="w-full h-full object-contain p-2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7">
          <div className="text-center mb-5">
            <h3 className="font-brand text-xl font-light text-white uppercase tracking-[0.2em]">
              ACCESO A LA GALA
            </h3>
            <p className="text-xs text-gala-muted mt-1">
              Ingresa con tu usuario y código asignado para emitir tu voto
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. carlos o admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-gold-500 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
                Código de Acceso
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Ej. VOTE101 o GALA2025"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-gold-500 focus:outline-none text-white text-sm placeholder-gray-600 transition-colors tracking-widest uppercase font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center space-x-2 mt-2 shadow"
            >
              <span>{loading ? 'Verificando...' : 'Entrar a Votar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Pick Test Accounts */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider text-center mb-2">
              Acceso rápido para probar:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('admin', 'GALA2025')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gold-300 hover:bg-gold-500 hover:text-black font-semibold transition-all flex items-center justify-between"
              >
                <div className="text-left truncate">
                  <span className="block font-bold truncate">Admin</span>
                  <span className="text-[10px] opacity-70 font-mono">GALA2025</span>
                </div>
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              </button>

              <button
                onClick={() => handleQuickLogin('carlos', 'VOTE101')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/15 font-semibold transition-all flex items-center justify-between"
              >
                <div className="text-left truncate">
                  <span className="block font-bold truncate">Carlos</span>
                  <span className="text-[10px] opacity-70 font-mono">VOTE101</span>
                </div>
                <User className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
