import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GUANTE_ORO_POINTS } from '../../types';
import { NomineeCard } from '../NomineeCard';
import { ShieldCheck, Save, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GuanteDeOroVoting: React.FC = () => {
  const { nominees, userBallot, submitBallotForCategory, currentUser, settings } = useApp();

  const eligibleNominees = nominees.filter(n => !n.hidden && (n.categories.includes('guante_oro') || n.position === 'Portero'));

  const [top3, setTop3] = useState<string[]>(() => {
    return userBallot.guante_oro || [];
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userBallot.guante_oro) {
      setTop3(userBallot.guante_oro);
    }
  }, [userBallot.guante_oro]);

  const handleSelectNominee = (id: string) => {
    if (!settings.votingOpen) {
      setStatusMsg({ type: 'error', text: 'Las votaciones están cerradas.' });
      return;
    }

    if (top3.includes(id)) {
      setTop3(prev => prev.filter(item => item !== id));
      setStatusMsg(null);
      return;
    }

    if (top3.length >= 3) {
      setStatusMsg({ type: 'error', text: 'Ya has seleccionado tu podio de 3 porteros. Remueve uno para cambiar.' });
      return;
    }

    setTop3(prev => [...prev, id]);
    setStatusMsg(null);
  };

  const handleRemoveRank = (index: number) => {
    setTop3(prev => prev.filter((_, i) => i !== index));
    setStatusMsg(null);
  };

  const handleSaveVote = async () => {
    if (!currentUser) {
      setStatusMsg({ type: 'error', text: 'Debes iniciar sesión con tu cuenta para guardar tu voto.' });
      return;
    }

    if (top3.length < 3) {
      setStatusMsg({ type: 'error', text: `Debes elegir tus 3 mejores porteros (1º, 2º y 3º). Llevas ${top3.length} de 3.` });
      return;
    }

    setIsSaving(true);
    const res = await submitBallotForCategory('guante_oro', top3);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: '¡Tu votación para el Guante de Oro ha sido guardada!' });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5A869', '#E6D6AB', '#ffffff'],
      });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const nextRank = top3.length < 3 ? top3.length + 1 : undefined;

  return (
    <div className="space-y-8">
      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* PODIUM SECTION */}
      <section className="bg-[#111319] border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <h2 className="font-brand font-medium text-lg sm:text-xl text-white tracking-[0.14em] uppercase">
              PODIO DEL GUANTE DE ORO
            </h2>
            <p className="text-xs text-gala-muted mt-0.5">
              Toca a tus 3 mejores porteros: 1º (10 pts), 2º (7 pts) y 3º (5 pts).
            </p>
          </div>

          <button
            onClick={handleSaveVote}
            disabled={isSaving || !settings.votingOpen || top3.length < 3}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-xs uppercase tracking-[0.14em] transition-all flex items-center space-x-2 disabled:opacity-30"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Confirmar Podio'}</span>
          </button>
        </div>

        {/* PODIUM SLOTS (2nd - 1st - 3rd) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* 2nd Place */}
          {(() => {
            const nominee = top3[1] ? nominees.find(n => n.id === top3[1]) : null;
            return (
              <div className="order-2 md:order-1 flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-400 tracking-wider mb-2 uppercase">
                  2º Puesto (+7 pts)
                </span>
                <div className={`w-full rounded-2xl p-5 border flex flex-col items-center text-center transition-all ${
                  nominee ? 'bg-[#151822] border-white/20' : 'bg-white/[0.02] border-dashed border-white/10'
                }`}>
                  {nominee ? (
                    <>
                      <span className="text-xs font-bold text-gray-400 px-2.5 py-0.5 rounded bg-white/5 uppercase mb-2">
                        Plata
                      </span>
                      <h4 className="font-brand font-semibold text-white text-base uppercase truncate max-w-full">{nominee.name}</h4>
                      <p className="text-xs text-gold-400 truncate max-w-full">{nominee.team}</p>
                      <button
                        onClick={() => handleRemoveRank(1)}
                        className="mt-3 text-[11px] text-gray-400 hover:text-rose-400 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </>
                  ) : (
                    <div className="py-8 text-gray-500 text-xs italic">
                      Vacío (2º Mejor Portero)
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 1st Place (Center) */}
          {(() => {
            const nominee = top3[0] ? nominees.find(n => n.id === top3[0]) : null;
            return (
              <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-2">
                <div className="flex items-center space-x-1 text-gold-400 font-semibold text-xs tracking-widest uppercase mb-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>1º Ganador (+10 pts)</span>
                </div>
                <div className={`w-full rounded-2xl p-6 border flex flex-col items-center text-center transition-all ${
                  nominee 
                    ? 'bg-[#151822] border-gold-500/60 shadow-md' 
                    : 'bg-white/[0.03] border-dashed border-gold-500/30'
                }`}>
                  {nominee ? (
                    <>
                      <div className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 font-brand font-semibold text-xs uppercase tracking-wider mb-2">
                        Guante de Oro
                      </div>
                      <h4 className="font-brand font-bold text-white text-lg uppercase truncate max-w-full">{nominee.name}</h4>
                      <p className="text-xs text-gold-400 truncate max-w-full">{nominee.team}</p>
                      <button
                        onClick={() => handleRemoveRank(0)}
                        className="mt-3 text-[11px] text-gray-400 hover:text-rose-400 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </>
                  ) : (
                    <div className="py-10 text-gold-400/60 text-xs italic">
                      Toca a tu Mejor Portero de la lista
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 3rd Place */}
          {(() => {
            const nominee = top3[2] ? nominees.find(n => n.id === top3[2]) : null;
            return (
              <div className="order-3 flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-400 tracking-wider mb-2 uppercase">
                  3º Puesto (+5 pts)
                </span>
                <div className={`w-full rounded-2xl p-5 border flex flex-col items-center text-center transition-all ${
                  nominee ? 'bg-[#151822] border-white/20' : 'bg-white/[0.02] border-dashed border-white/10'
                }`}>
                  {nominee ? (
                    <>
                      <span className="text-xs font-bold text-amber-700 px-2.5 py-0.5 rounded bg-white/5 uppercase mb-2">
                        Bronce
                      </span>
                      <h4 className="font-brand font-semibold text-white text-base uppercase truncate max-w-full">{nominee.name}</h4>
                      <p className="text-xs text-gold-400 truncate max-w-full">{nominee.team}</p>
                      <button
                        onClick={() => handleRemoveRank(2)}
                        className="mt-3 text-[11px] text-gray-400 hover:text-rose-400 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </>
                  ) : (
                    <div className="py-8 text-gray-500 text-xs italic">
                      Vacío (3º Mejor Portero)
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* NOMINEES CATALOG */}
      <div>
        <h3 className="font-brand text-xl font-light text-white uppercase tracking-[0.14em] mb-1">
          ARQUEROS CANDIDATOS ({eligibleNominees.length})
        </h3>
        <p className="text-xs text-gala-muted mb-6">
          Toca a un portero para sumarlo a tu podio (1º, 2º y 3º).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {eligibleNominees.map((nominee) => {
            const rankIndex = top3.indexOf(nominee.id);
            const isSelected = rankIndex !== -1;
            const rank = isSelected ? rankIndex + 1 : undefined;

            return (
              <NomineeCard
                key={nominee.id}
                nominee={nominee}
                rank={rank}
                isSelected={isSelected}
                nextRankToAssign={!isSelected ? nextRank : undefined}
                onSelect={() => handleSelectNominee(nominee.id)}
                actionLabel={isSelected ? 'En tu Podio' : 'Elegir para Podio'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
