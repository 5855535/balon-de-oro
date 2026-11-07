import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, Trophy, ShieldCheck, Users, Flame, Award, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BallotSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCategory: (cat: any) => void;
}

export const BallotSummaryModal: React.FC<BallotSummaryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCategory,
}) => {
  const { currentUser, userBallot, nominees, submitFullBallot, settings } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const bTop10 = userBallot.ballon_dor || [];
  const gTop3 = userBallot.guante_oro || [];
  const qQuinteto = userBallot.quinteto_ideal;
  const mTop5 = userBallot.goleador || [];

  const qFilledCount = qQuinteto 
    ? (Array.isArray(qQuinteto.players) 
        ? qQuinteto.players.filter(Boolean).length 
        : Object.values(qQuinteto).filter(Boolean).length)
    : 0;

  const isBallonDone = bTop10.length === 10;
  const isGuanteDone = gTop3.length === 3;
  const isQuintetoDone = qFilledCount === 5;
  const isGoleadorDone = mTop5.length === 5;

  const allCompleted = isBallonDone && isGuanteDone && isQuintetoDone && isGoleadorDone;

  const handleSealBallot = async () => {
    setIsSubmitting(true);
    const res = await submitFullBallot();
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(true);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#ffffff', '#F6E07A'],
      });
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gala-card border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-glow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">
            Papeleta Oficial de Votación
          </h3>
          <p className="text-xs text-gala-muted mt-1">
            Votante: <span className="text-gold-300 font-semibold">{currentUser?.displayName}</span>
          </p>
          {currentUser?.hasVoted && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Voto sellado y registrado para la gala</span>
            </div>
          )}
        </div>

        {/* Categories checklist */}
        <div className="space-y-4 mb-6">
          
          {/* 1. Ballon d'Or */}
          <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-sm">Ballon d'Or</h4>
                <p className="text-xs text-gray-400">{bTop10.length} de 10 seleccionados</p>
              </div>
            </div>
            <div>
              {isBallonDone ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  Listo ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    onNavigateToCategory('ballon_dor');
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30 text-xs font-semibold"
                >
                  Completar
                </button>
              )}
            </div>
          </div>

          {/* 2. Guante de Oro */}
          <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-sm">Guante de Oro</h4>
                <p className="text-xs text-gray-400">{gTop3.length} de 3 arqueros</p>
              </div>
            </div>
            <div>
              {isGuanteDone ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  Listo ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    onNavigateToCategory('guante_oro');
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30 text-xs font-semibold"
                >
                  Completar
                </button>
              )}
            </div>
          </div>

          {/* 3. Quinteto Ideal */}
          <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-sm">Quinteto Ideal Futsal</h4>
                <p className="text-xs text-gray-400">
                  {qFilledCount} de 5 titulares
                </p>
              </div>
            </div>
            <div>
              {isQuintetoDone ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  Listo ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    onNavigateToCategory('quinteto_ideal');
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30 text-xs font-semibold"
                >
                  Completar
                </button>
              )}
            </div>
          </div>

          {/* 4. Mejor Goleador */}
          <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-sm">Mejor Goleador</h4>
                <p className="text-xs text-gray-400">{mTop5.length} de 5 elegidos</p>
              </div>
            </div>
            <div>
              {isGoleadorDone ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  Listo ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    onNavigateToCategory('goleador');
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30 text-xs font-semibold"
                >
                  Completar
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Seal Ballot Action */}
        <div className="pt-4 border-t border-white/10 text-center">
          {successMsg ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
              ✨ ¡Tu papeleta completa ha sido sellada y guardada con honores!
            </div>
          ) : (
            <button
              onClick={handleSealBallot}
              disabled={isSubmitting || !settings.votingOpen}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-200 text-black font-extrabold text-xs uppercase tracking-widest hover:brightness-110 shadow-gold-glow transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {currentUser?.hasVoted ? 'Actualizar y Sellar Papeleta' : 'Sellar Mi Voto Definitivo'}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
