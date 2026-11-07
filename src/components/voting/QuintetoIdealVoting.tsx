import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FUTSAL_FORMATIONS, FutsalFormation, QuintetoBallot } from '../../types';
import { Save, CheckCircle2, AlertCircle, Plus, X, UserCheck, Search, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuintetoIdealVoting: React.FC = () => {
  const { nominees, userBallot, submitBallotForCategory, currentUser, settings } = useApp();

  const [selectedFormationId, setSelectedFormationId] = useState<string>(() => {
    return userBallot.quinteto_ideal?.formationId || '1-2-1';
  });

  const [players, setPlayers] = useState<[string, string, string, string, string]>(() => {
    return userBallot.quinteto_ideal?.players || ['', '', '', '', ''];
  });

  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userBallot.quinteto_ideal) {
      if (userBallot.quinteto_ideal.formationId) {
        setSelectedFormationId(userBallot.quinteto_ideal.formationId);
      }
      if (userBallot.quinteto_ideal.players) {
        setPlayers(userBallot.quinteto_ideal.players);
      }
    }
  }, [userBallot.quinteto_ideal]);

  const currentFormation: FutsalFormation = 
    FUTSAL_FORMATIONS.find(f => f.id === selectedFormationId) || FUTSAL_FORMATIONS[0];

  const handleSelectFormation = (formId: string) => {
    setSelectedFormationId(formId);
  };

  // 1-TAP INSTANT PLACEMENT (Mobile-First, No Awkward Dragging)
  const handleAssignPlayer = (nomineeId: string) => {
    if (!settings.votingOpen) {
      setStatusMsg({ type: 'error', text: 'Las votaciones están cerradas.' });
      return;
    }

    const existingIndex = players.indexOf(nomineeId);

    // If player is already in this exact slot, remove him
    if (existingIndex === activeSlotIndex) {
      handleClearSlot(activeSlotIndex);
      return;
    }

    setPlayers(prev => {
      const next = [...prev] as [string, string, string, string, string];
      // If was in another slot, clear the previous slot
      if (existingIndex !== -1) {
        next[existingIndex] = '';
      }
      next[activeSlotIndex] = nomineeId;
      return next;
    });

    // Automatically advance to the next unoccupied slot
    const nextEmpty = players.findIndex((p, idx) => idx !== activeSlotIndex && !p);
    if (nextEmpty !== -1) {
      setActiveSlotIndex(nextEmpty);
    }

    setStatusMsg(null);
  };

  const handleClearSlot = (index: number) => {
    setPlayers(prev => {
      const next = [...prev] as [string, string, string, string, string];
      next[index] = '';
      return next;
    });
  };

  const filledCount = players.filter(Boolean).length;

  const handleSaveQuinteto = async () => {
    if (!currentUser) {
      setStatusMsg({ type: 'error', text: 'Debes iniciar sesión con tu cuenta para guardar tu quinteto.' });
      return;
    }

    if (filledCount < 5) {
      setStatusMsg({ 
        type: 'error', 
        text: `Debes completar los 5 puestos del quinteto. Llevas ${filledCount} de 5 alineados.` 
      });
      return;
    }

    const ballot: QuintetoBallot = {
      formationId: selectedFormationId,
      players,
    };

    setIsSaving(true);
    const res = await submitBallotForCategory('quinteto_ideal', ballot);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: `¡Tu Quinteto Ideal en esquema ${currentFormation.id} ha sido sellado!` });
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#C5A869', '#E6D6AB', '#ffffff'],
      });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const filteredCandidates = nominees.filter(n => {
    if (n.hidden) return false;
    const term = searchTerm.toLowerCase();
    return n.name.toLowerCase().includes(term) || n.team.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {statusMsg && (
        <div className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span className="text-xs font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* COMPACT FORMATIONS HEADER */}
      <div className="bg-[#111319] border border-white/10 rounded-2xl p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gold-400" />
            <h2 className="font-brand font-medium text-sm sm:text-lg text-white tracking-[0.1em] uppercase">
              QUINTETO IDEAL
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gold-400 font-semibold">
              {filledCount}/5
            </span>

            <button
              onClick={handleSaveQuinteto}
              disabled={isSaving || !settings.votingOpen || filledCount < 5}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center space-x-1 disabled:opacity-30 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {/* 5 FORMATIONS BUTTONS (SWIPEABLE HORIZONTAL PILLS) */}
        <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold mr-1 flex-shrink-0">
            Formación:
          </span>
          {FUTSAL_FORMATIONS.map(formation => {
            const isSelected = selectedFormationId === formation.id;
            return (
              <button
                key={formation.id}
                onClick={() => handleSelectFormation(formation.id)}
                className={`py-1 px-3 rounded-lg border text-center transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#181B26] border-gold-500 text-gold-300 font-bold'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-brand text-xs">
                  {formation.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMNS: COURT (TOP) + CANDIDATES (BELOW ON MOBILE, SIDE-BY-SIDE ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* COMPACT FUTSAL COURT */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div 
            className="w-full max-w-[340px] sm:max-w-[400px] aspect-[10/11] bg-[#0c1420] rounded-2xl border border-white/15 relative overflow-hidden p-2.5 select-none shadow-xl"
          >
            {/* Court Markings */}
            <div className="absolute inset-2.5 border border-white/20 rounded-xl pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 border-b border-x border-white/20 rounded-b-xl" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-10 border-t border-x border-white/20 rounded-t-xl" />
            </div>

            {/* Scheme Tag */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-white/15 text-[9px] font-semibold uppercase tracking-widest text-gold-400 pointer-events-none">
              {currentFormation.id} · {currentFormation.name.split(' ')[1] || ''}
            </div>

            {/* 5 POSITION SLOTS */}
            {currentFormation.slots.map((slot, index) => {
              const assignedId = players[index];
              const player = assignedId ? nominees.find(n => n.id === assignedId) : null;
              const isActive = activeSlotIndex === index;

              return (
                <div
                  key={index}
                  style={{ top: slot.topPct, left: slot.leftPct }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer select-none"
                  onClick={() => setActiveSlotIndex(index)}
                >
                  <div className={`relative transition-all duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    {/* Position Pin Box */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gold-500 text-black ring-4 ring-gold-400/80 shadow-lg'
                        : player
                        ? 'bg-[#181B26] border border-gold-500/70 text-white shadow'
                        : 'bg-black/80 border-2 border-dashed border-white/30 text-gray-400 hover:border-gold-400'
                    }`}>
                      <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
                        {player ? (
                          <span className="font-brand font-bold text-[11px] sm:text-xs uppercase truncate max-w-full">
                            {player.name.split(' ')[0]}
                          </span>
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Role Tag on Top */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-semibold uppercase tracking-wider bg-black/95 text-gray-300 border border-white/20 whitespace-nowrap shadow">
                      {slot.label}
                    </span>

                    {/* Quick remove button */}
                    {player && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSlot(index);
                        }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[9px] shadow"
                        title="Quitar de la cancha"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Player Name Tag below pin */}
                  <div className="mt-0.5 text-center max-w-[95px]">
                    <span className={`block text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 rounded truncate shadow ${
                      player
                        ? 'bg-black/90 text-white border border-white/10 font-brand'
                        : isActive
                        ? 'bg-gold-500 text-black font-semibold'
                        : 'bg-black/60 text-gray-400'
                    }`}>
                      {player ? player.name : `+ ${slot.label}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-center">
            <p className="text-[11px] text-gray-300">
              👉 Toca la posición en la cancha y luego <strong>toca al jugador</strong> abajo.
            </p>
          </div>
        </div>

        {/* CANDIDATES LIST: 2-COLUMN FAST-TAP (ZERO FRICTION) */}
        <div className="lg:col-span-6 bg-[#111319] border border-white/10 rounded-2xl p-3 sm:p-4">
          
          {/* Header indicator */}
          <div className="pb-2.5 border-b border-white/10 mb-2.5 flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-semibold block">
                Seleccionando para:
              </span>
              <h3 className="font-brand text-xs sm:text-sm font-semibold text-white uppercase flex items-center space-x-1">
                <span className="text-gold-400">#{activeSlotIndex + 1}</span>
                <span>{currentFormation.slots[activeSlotIndex]?.label}</span>
              </h3>
            </div>

            {/* Instant search */}
            <div className="w-36 sm:w-48">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar amigo..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px] placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* CANDIDATES 2-COLUMN TAP GRID */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1">
            {filteredCandidates.map((nominee) => {
              const isAssignedHere = players[activeSlotIndex] === nominee.id;
              const assignedSlotIndex = players.indexOf(nominee.id);
              const isAssignedElsewhere = assignedSlotIndex !== -1 && assignedSlotIndex !== activeSlotIndex;

              return (
                <div
                  key={nominee.id}
                  onClick={() => handleAssignPlayer(nominee.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between select-none cursor-pointer active:scale-95 ${
                    isAssignedHere
                      ? 'bg-[#181B26] border-gold-500 shadow ring-1 ring-gold-500/50'
                      : isAssignedElsewhere
                      ? 'bg-transparent border-white/5 opacity-50 hover:opacity-100'
                      : 'bg-transparent border-white/5 hover:border-gold-500/40 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="truncate pr-1">
                    <h4 className="font-brand text-[11px] sm:text-xs font-semibold text-white uppercase truncate">
                      {nominee.name}
                    </h4>
                    <p className="text-[9px] text-gray-500 truncate">
                      {nominee.team}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {isAssignedHere ? (
                      <span className="w-6 h-6 rounded-md bg-gold-500 text-black flex items-center justify-center font-bold text-xs shadow">
                        <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    ) : isAssignedElsewhere ? (
                      <span className="text-[8px] text-gray-400 px-1 py-0.5 rounded bg-white/5 font-semibold">
                        {currentFormation.slots[assignedSlotIndex]?.label.slice(0, 3)}
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-md bg-white/5 hover:bg-gold-500 hover:text-black text-gray-300 flex items-center justify-center text-xs font-bold transition-colors">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
