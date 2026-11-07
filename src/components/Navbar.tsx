import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User, LogOut, Database, Award, CheckCircle } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onOpenBallotSummary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenAdmin, onOpenBallotSummary }) => {
  const { currentUser, logout, settings, isSupabaseConnected, userBallot } = useApp();

  const totalCategoriesVoted = [
    userBallot.ballon_dor?.length ? 1 : 0,
    userBallot.guante_oro?.length ? 1 : 0,
    userBallot.quinteto_ideal ? 1 : 0,
    userBallot.goleador?.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#090A0D]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Ballon d'Or Clean Typographic Wordmark */}
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1">
                <span className="font-brand font-light tracking-[0.22em] text-xl sm:text-2xl text-white group-hover:text-gold-300 transition-colors uppercase">
                  BALLON D'OR
                </span>
                <span className="text-[10px] text-gold-500 font-bold self-start mt-0.5">™</span>
              </div>
              <span className="text-[9px] tracking-[0.32em] uppercase text-gold-500/80 font-medium -mt-0.5">
                Gala Oficial de Futsal
              </span>
            </div>
          </div>

          {/* Center Info / Voting Status */}
          <div className="hidden md:flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider flex items-center space-x-2 border ${
              settings.votingOpen 
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-950/20 text-rose-400 border-rose-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings.votingOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{settings.votingOpen ? 'Votaciones Abiertas' : 'Votaciones Cerradas'}</span>
            </div>

            {/* Supabase indicator badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center space-x-1.5 border ${
              isSupabaseConnected 
                ? 'bg-blue-950/20 text-blue-300 border-blue-500/20' 
                : 'bg-white/5 text-gray-400 border-white/10'
            }`} title={isSupabaseConnected ? 'Conectado a Supabase' : 'Modo local activo'}>
              <Database className="w-3 h-3" />
              <span>{isSupabaseConnected ? 'Supabase' : 'Local'}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* User Ballot Tracker */}
                <button
                  onClick={onOpenBallotSummary}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center space-x-2"
                  title="Ver resumen de mis votos"
                >
                  <Award className="w-3.5 h-3.5 text-gold-400" />
                  <span className="hidden sm:inline">Mi Voto:</span>
                  <span className="font-bold text-gold-400">{totalCategoriesVoted}/4</span>
                  {currentUser.hasVoted && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                  )}
                </button>

                {/* Admin button if role is admin */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onOpenAdmin}
                    className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-semibold text-xs tracking-wider uppercase transition-all flex items-center space-x-1.5 shadow"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}

                {/* User info */}
                <div className="flex items-center pl-2 space-x-2 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[10px] text-gold-500/80 capitalize">
                      {currentUser.role === 'admin' ? 'Administrador' : 'Votante'}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-semibold text-xs tracking-[0.15em] uppercase transition-all shadow flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Acceso Amigos</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
