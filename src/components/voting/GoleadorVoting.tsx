import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GOLEADOR_POINTS } from '../../types';
import { NomineeCard } from '../NomineeCard';
import { Save, CheckCircle2, AlertCircle, X, Search, List, LayoutGrid } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoleadorVoting: React.FC = () => {
  const { nominees, userBallot, submitBallotForCategory, currentUser, settings } = useApp();

  const eligibleNominees = nominees.filter(n => !n.hidden && (n.categories.includes('goleador') || n.position === 'Pívot' || n.position === 'Ala' || n.position === 'Jugador'));

  const [top5, setTop5] = useState<string[]>(() => {
    return userBallot.goleador || [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'poster' | 'cards'>('poster');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userBallot.goleador) {
      setTop5(userBallot.goleador);
    }
  }, [userBallot.goleador]);

  const handleTapNominee = (id: string) => {
    if (!settings.votingOpen) {
      setStatusMsg({ type: 'error', text: 'Las votaciones están cerradas.' });
      return;
    }

    if (top5.includes(id)) {
      setTop5(prev => prev.filter(item => item !== id));
      setStatusMsg(null);
      return;
    }

    if (top5.length >= 5) {
      setStatusMsg({ type: 'error', text: 'Ya has seleccionado tu Top 5 de goleadores. Remueve uno para reemplazarlo.' });
      return;
    }

    setTop5(prev => [...prev, id]);
    setStatusMsg(null);
  };

  const handleRemoveRank = (index: number) => {
    setTop5(prev => prev.filter((_, i) => i !== index));
    setStatusMsg(null);
  };

  const handleSaveVote = async () => {
    if (!currentUser) {
      setStatusMsg({ type: 'error', text: 'Debes iniciar sesión con tu cuenta para guardar tu voto.' });
      return;
    }

    if (top5.length < 5) {
      setStatusMsg({ type: 'error', text: `Debes elegir a tus 5 mejores goleadores y generadores. Llevas ${top5.length} de 5.` });
      return;
    }

    setIsSaving(true);
    const res = await submitBallotForCategory('goleador', top5);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: '¡Tu votación al Mejor Goleador ha sido guardada con éxito!' });
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A869', '#E6D6AB', '#ffffff'],
      });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const nextRank = top5.length < 5 ? top5.length + 1 : undefined;

  const filteredNominees = eligibleNominees.filter(n => {
    const term = searchTerm.toLowerCase();
    return n.name.toLowerCase().includes(term) || n.team.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span className="text-xs sm:text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* TOP 5 SCORERS PODIUM */}
      <section className="bg-[#111319] border border-white/10 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2 sm:gap-4">
          <div>
            <h2 className="font-brand font-medium text-base sm:text-xl text-white tracking-[0.12em] uppercase">
              TOP 5 GOLEADORES
            </h2>
            <p className="text-[11px] sm:text-xs text-gala-muted mt-0.5">
              1º (15 pts), 2º (12 pts), 3º (10 pts), 4º (8 pts), 5º (5 pts).
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gold-400 font-semibold">
              {top5.length}/5
            </span>

            <button
              onClick={handleSaveVote}
              disabled={isSaving || !settings.votingOpen || top5.length < 5}
              className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-xs uppercase tracking-[0.14em] transition-all flex items-center space-x-1.5 disabled:opacity-30 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Confirmar Goleadores'}</span>
            </button>
          </div>
        </div>

        {/* 5 Ranked Slots (Swipeable on mobile) */}
        <div className="mt-3 flex overflow-x-auto no-scrollbar gap-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
          {Array.from({ length: 5 }).map((_, index) => {
            const nomineeId = top5[index];
            const nominee = nomineeId ? nominees.find(n => n.id === nomineeId) : null;
            const points = GOLEADOR_POINTS[index];

            return (
              <div
                key={index}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all flex flex-col justify-between flex-shrink-0 w-24 sm:w-auto min-h-[76px] sm:min-h-[86px] ${
                  nominee
                    ? 'bg-[#151822] border-white/20'
                    : 'bg-white/[0.02] border-dashed border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center font-brand font-bold text-[10px] sm:text-xs ${
                    index === 0 ? 'bg-gold-500 text-black' : 'bg-white/10 text-gray-300'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-gold-400">+{points}p</span>
                </div>

                <div className="my-1">
                  {nominee ? (
                    <p className="font-brand text-[10px] sm:text-xs font-semibold text-white uppercase truncate">
                      {nominee.name.split(' ')[0]}
                    </p>
                  ) : (
                    <span className="text-[9px] text-gray-500 italic block">
                      {index === top5.length ? 'Siguiente' : 'Vacío'}
                    </span>
                  )}
                </div>

                {nominee && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveRank(index)}
                      className="text-[9px] text-gray-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SEARCH AND CANDIDATES (2 COLS ON MOBILE) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar amigo..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111319] border border-white/10 text-white text-xs placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/10 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('poster')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'poster' ? 'bg-gold-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'cards' ? 'bg-gold-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
          </div>
        </div>

        {viewMode === 'poster' ? (
          <div className="bg-[#0E1016] border border-white/10 rounded-2xl p-3 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
              {filteredNominees.map((nominee) => {
                const rankIndex = top5.indexOf(nominee.id);
                const isSelected = rankIndex !== -1;
                const rank = isSelected ? rankIndex + 1 : undefined;

                return (
                  <div
                    key={nominee.id}
                    onClick={() => handleTapNominee(nominee.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between select-none ${
                      isSelected
                        ? 'bg-[#171A24] border-gold-500'
                        : 'bg-transparent border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate mb-1 sm:mb-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-md bg-gold-500 text-black font-brand font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          #{rank}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mx-1.5 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <h4 className="font-brand text-xs sm:text-sm font-semibold uppercase text-white truncate">
                          {nominee.name}
                        </h4>
                        <p className="text-[9px] text-gray-400 truncate">{nominee.team}</p>
                      </div>
                    </div>

                    <div className="flex justify-end flex-shrink-0">
                      {isSelected ? (
                        <span className="text-[9px] font-bold text-gold-400 uppercase">#{rank}</span>
                      ) : nextRank ? (
                        <span className="text-[9px] text-gray-400 uppercase">+ #{nextRank}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredNominees.map((nominee) => {
              const rankIndex = top5.indexOf(nominee.id);
              const isSelected = rankIndex !== -1;
              const rank = isSelected ? rankIndex + 1 : undefined;

              return (
                <NomineeCard
                  key={nominee.id}
                  nominee={nominee}
                  rank={rank}
                  isSelected={isSelected}
                  nextRankToAssign={!isSelected ? nextRank : undefined}
                  onSelect={() => handleTapNominee(nominee.id)}
                  actionLabel={isSelected ? 'En tu Top' : 'Añadir al Top 5'}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
