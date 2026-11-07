import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BALLON_DOR_POINTS } from '../../types';
import { NomineeCard } from '../NomineeCard';
import { CheckCircle2, AlertCircle, Save, X, Search, LayoutGrid, List } from 'lucide-react';
import confetti from 'canvas-confetti';

type LetterFilter = 'ALL' | 'A-F' | 'G-M' | 'N-S' | 'T-Z';

export const BallonDorVoting: React.FC = () => {
  const { nominees, userBallot, submitBallotForCategory, currentUser, settings } = useApp();
  
  const eligibleNominees = nominees.filter(n => !n.hidden && n.categories.includes('ballon_dor'));

  const [top10, setTop10] = useState<string[]>(() => {
    return userBallot.ballon_dor || [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [letterFilter, setLetterFilter] = useState<LetterFilter>('ALL');
  const [viewMode, setViewMode] = useState<'poster' | 'cards'>('poster');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userBallot.ballon_dor) {
      setTop10(userBallot.ballon_dor);
    }
  }, [userBallot.ballon_dor]);

  const handleTapNominee = (id: string) => {
    if (!settings.votingOpen) {
      setStatusMsg({ type: 'error', text: 'Las votaciones están oficialmente cerradas.' });
      return;
    }

    const currentIndex = top10.indexOf(id);

    if (currentIndex !== -1) {
      setTop10(prev => prev.filter(item => item !== id));
      setStatusMsg(null);
      setSwapSourceIndex(null);
      return;
    }

    if (top10.length >= 10) {
      setStatusMsg({ 
        type: 'error', 
        text: '¡Top 10 completo! Toca a cualquier jugador de tu podio para removerlo y hacer espacio.' 
      });
      return;
    }

    setTop10(prev => [...prev, id]);
    setStatusMsg(null);
  };

  const handleRemoveRank = (index: number) => {
    setTop10(prev => prev.filter((_, i) => i !== index));
    setSwapSourceIndex(null);
    setStatusMsg(null);
  };

  const handleSlotClick = (index: number) => {
    if (swapSourceIndex === null) {
      if (top10[index]) {
        setSwapSourceIndex(index);
      }
    } else {
      if (swapSourceIndex === index) {
        setSwapSourceIndex(null);
      } else {
        setTop10(prev => {
          const next = [...prev];
          const temp = next[swapSourceIndex];
          next[swapSourceIndex] = next[index];
          next[index] = temp;
          return next;
        });
        setSwapSourceIndex(null);
      }
    }
  };

  const handleSaveVote = async () => {
    if (!currentUser) {
      setStatusMsg({ type: 'error', text: 'Debes iniciar sesión con tu cuenta para registrar tu voto.' });
      return;
    }

    if (top10.length < 10) {
      setStatusMsg({ 
        type: 'error', 
        text: `Debes completar tu Top 10 para la gala. Llevas ${top10.length} de 10 seleccionados.` 
      });
      return;
    }

    setIsSaving(true);
    const res = await submitBallotForCategory('ballon_dor', top10);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: '¡Tu Top 10 del Balón de Oro ha sido registrado para la premiación!' });
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#C5A869', '#E6D6AB', '#ffffff'],
      });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const filteredNominees = eligibleNominees.filter(n => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = n.name.toLowerCase().includes(term) || 
                          n.team.toLowerCase().includes(term) || 
                          (n.nickname && n.nickname.toLowerCase().includes(term));
    if (!matchesSearch) return false;

    if (letterFilter === 'ALL') return true;
    const firstLetter = n.name.trim().charAt(0).toUpperCase();
    if (letterFilter === 'A-F') return firstLetter >= 'A' && firstLetter <= 'F';
    if (letterFilter === 'G-M') return firstLetter >= 'G' && firstLetter <= 'M';
    if (letterFilter === 'N-S') return firstLetter >= 'N' && firstLetter <= 'S';
    if (letterFilter === 'T-Z') return firstLetter >= 'T' && firstLetter <= 'Z';
    return true;
  });

  const nextRank = top10.length < 10 ? top10.length + 1 : undefined;

  return (
    <div className="space-y-6">
      
      {/* Status banner */}
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

      {/* COMPACT RESTRAINED TOP 10 PODIUM BAR */}
      <section className="bg-[#111319] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2 sm:gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-brand font-medium text-base sm:text-xl text-white tracking-[0.12em] uppercase">
                TU TOP 10
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/5 text-gold-400 border border-white/10">
                {top10.length}/10
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gala-muted mt-0.5">
              {nextRank ? (
                <span>
                  Siguiente toque: <strong className="text-gold-400">Puesto #{nextRank} (+{BALLON_DOR_POINTS[nextRank - 1]} pts)</strong>
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  ✓ Top 10 completo listo para sellar.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
            {top10.length > 0 && (
              <button
                onClick={() => setTop10([])}
                className="px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 transition-colors"
              >
                Limpiar
              </button>
            )}

            <button
              onClick={handleSaveVote}
              disabled={isSaving || !settings.votingOpen || top10.length < 10}
              className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-xs uppercase tracking-[0.14em] transition-all flex items-center space-x-1.5 disabled:opacity-30 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Confirmar Top 10'}</span>
            </button>
          </div>
        </div>

        {/* 10 SLOTS (SWIPEABLE HORIZONTAL ON MOBILE, 10-COL GRID ON DESKTOP) */}
        <div className="mt-3 flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:grid sm:grid-cols-5 lg:grid-cols-10 sm:overflow-visible">
          {Array.from({ length: 10 }).map((_, index) => {
            const nomineeId = top10[index];
            const nominee = nomineeId ? nominees.find(n => n.id === nomineeId) : null;
            const points = BALLON_DOR_POINTS[index];
            const isSwapping = swapSourceIndex === index;

            return (
              <div
                key={index}
                onClick={() => handleSlotClick(index)}
                className={`relative rounded-xl p-2 border transition-all cursor-pointer flex flex-col justify-between flex-shrink-0 w-24 sm:w-auto min-h-[76px] sm:min-h-[86px] ${
                  isSwapping
                    ? 'ring-1 ring-gold-400 bg-gold-500/10 border-gold-400'
                    : nominee
                    ? 'bg-[#151822] border-white/15 hover:border-gold-500/50'
                    : index === top10.length
                    ? 'bg-white/[0.04] border-dashed border-gold-500/50'
                    : 'bg-white/[0.01] border-dashed border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center font-brand font-bold text-[10px] sm:text-[11px] ${
                    index === 0
                      ? 'bg-gold-500 text-black'
                      : index === 1
                      ? 'bg-gray-300 text-black'
                      : index === 2
                      ? 'bg-amber-800 text-white'
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium text-gold-400">
                    +{points}p
                  </span>
                </div>

                <div className="my-1">
                  {nominee ? (
                    <p className="font-brand text-[10px] sm:text-[11px] font-semibold text-white uppercase truncate leading-tight">
                      {nominee.name.split(' ')[0]}
                    </p>
                  ) : (
                    <span className="text-[9px] text-gray-500 italic block leading-tight">
                      {index === top10.length ? 'Siguiente' : 'Vacío'}
                    </span>
                  )}
                </div>

                {nominee && (
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRank(index);
                      }}
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

      {/* SEARCH AND QUICK ALPHABETICAL FILTERS (SOLVES MOBILE SCROLLING) */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar amigo rápidamente..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111319] border border-white/10 text-white text-xs placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* View toggle */}
          <div className="flex justify-between sm:justify-end items-center space-x-2">
            <span className="text-[11px] text-gray-400 sm:hidden">
              {filteredNominees.length} amigos
            </span>

            <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('poster')}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  viewMode === 'poster'
                    ? 'bg-gold-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-gold-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        {/* ALPHABETICAL QUICK JUMP CHIPS (NO MORE SCROLLING FOREVER) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] text-gray-500 uppercase font-semibold mr-1 flex-shrink-0">
            Filtro:
          </span>
          {(['ALL', 'A-F', 'G-M', 'N-S', 'T-Z'] as LetterFilter[]).map((group) => (
            <button
              key={group}
              onClick={() => setLetterFilter(group)}
              className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                letterFilter === group
                  ? 'bg-gold-500 text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {group === 'ALL' ? 'Todos (22)' : group}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN COMPACT MOBILE LAYOUT */}
      {viewMode === 'poster' ? (
        <div className="bg-[#0E1016] border border-white/10 rounded-2xl p-3 sm:p-8 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-x-8 sm:gap-y-2">
            {filteredNominees.map((nominee) => {
              const rankIndex = top10.indexOf(nominee.id);
              const isSelected = rankIndex !== -1;
              const rank = isSelected ? rankIndex + 1 : undefined;

              return (
                <div
                  key={nominee.id}
                  onClick={() => handleTapNominee(nominee.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between select-none ${
                    isSelected
                      ? 'bg-[#171A24] border-gold-500'
                      : 'bg-transparent border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate mb-1 sm:mb-0">
                    {/* Rank pill */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gold-500 text-black font-brand font-bold text-[10px] sm:text-xs flex items-center justify-center">
                          #{rank}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mx-1.5" />
                      )}
                    </div>

                    <div className="truncate">
                      <h4 className="font-brand text-xs sm:text-sm font-semibold tracking-wide uppercase text-white truncate">
                        {nominee.name}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] uppercase text-gray-400 truncate">
                        {nominee.team}
                      </p>
                    </div>
                  </div>

                  {/* Tap badge */}
                  <div className="flex justify-end sm:justify-center flex-shrink-0">
                    {isSelected ? (
                      <span className="text-[9px] font-bold text-gold-400 uppercase">
                        #{rank} Elegido
                      </span>
                    ) : nextRank ? (
                      <span className="text-[9px] text-gray-400 hover:text-white uppercase">
                        + #{nextRank}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CARDS GRID (2-COLS ON MOBILE, NOT 1 COLUMN) */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredNominees.map((nominee) => {
            const rankIndex = top10.indexOf(nominee.id);
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
                onRemove={isSelected ? () => handleTapNominee(nominee.id) : undefined}
                actionLabel={isSelected ? 'En tu Top' : `Asignar #${nextRank}`}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};
