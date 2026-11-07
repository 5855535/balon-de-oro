import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FUTSAL_FORMATIONS, FutsalFormation, QuintetoBallot, Nominee } from '../../types';
import { Save, CheckCircle2, AlertCircle, Plus, X, UserCheck, Move, Search } from 'lucide-react';
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
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [draggingNomineeId, setDraggingNomineeId] = useState<string | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [touchDraggingNominee, setTouchDraggingNominee] = useState<Nominee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const handleAssignSlot = (slotIdx: number, nomineeId: string) => {
    if (!settings.votingOpen) {
      setStatusMsg({ type: 'error', text: 'Las votaciones están cerradas.' });
      return;
    }

    const existingIndex = players.indexOf(nomineeId);
    setPlayers(prev => {
      const next = [...prev] as [string, string, string, string, string];
      if (existingIndex !== -1 && existingIndex !== slotIdx) {
        next[existingIndex] = '';
      }
      next[slotIdx] = nomineeId;
      return next;
    });

    // Auto advance
    const nextEmpty = players.findIndex((p, idx) => idx !== slotIdx && !p);
    if (nextEmpty !== -1) {
      setActiveSlotIndex(nextEmpty);
    }

    setDragOverSlotIndex(null);
    setStatusMsg(null);
  };

  const handleClearSlot = (index: number) => {
    setPlayers(prev => {
      const next = [...prev] as [string, string, string, string, string];
      next[index] = '';
      return next;
    });
  };

  // HTML5 Drag handlers (Desktop)
  const handleDragStart = (e: React.DragEvent, nomineeId: string) => {
    e.dataTransfer.setData('text/plain', nomineeId);
    setDraggingNomineeId(nomineeId);
  };

  const handleDragEnd = () => {
    setDraggingNomineeId(null);
    setDragOverSlotIndex(null);
  };

  const handleDropOnSlot = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    const nomineeId = e.dataTransfer.getData('text/plain') || draggingNomineeId;
    if (nomineeId) {
      handleAssignSlot(slotIdx, nomineeId);
    }
    setDraggingNomineeId(null);
    setDragOverSlotIndex(null);
  };

  // Touch drag handlers (Mobile)
  const handleTouchStart = (nominee: Nominee, e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    setTouchDraggingNominee(nominee);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDraggingNominee) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    const hoveredSlot = slotRefs.current.findIndex(el => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        touch.clientX >= rect.left - 20 &&
        touch.clientX <= rect.right + 20 &&
        touch.clientY >= rect.top - 20 &&
        touch.clientY <= rect.bottom + 20
      );
    });

    setDragOverSlotIndex(hoveredSlot !== -1 ? hoveredSlot : null);
  };

  const handleTouchEnd = () => {
    if (touchDraggingNominee && dragOverSlotIndex !== null && dragOverSlotIndex >= 0) {
      handleAssignSlot(dragOverSlotIndex, touchDraggingNominee.id);
    }
    setTouchPos(null);
    setTouchDraggingNominee(null);
    setDragOverSlotIndex(null);
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

      {/* Floating Touch Drag Preview for Mobile */}
      {touchPos && touchDraggingNominee && (
        <div
          style={{
            position: 'fixed',
            left: touchPos.x,
            top: touchPos.y,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="px-3 py-1.5 rounded-lg bg-gold-500 text-black font-brand font-bold text-xs uppercase shadow-2xl flex items-center space-x-1 border border-white"
        >
          <span>{touchDraggingNominee.name}</span>
        </div>
      )}

      {/* COMPACT HEADER & HORIZONTAL FORMATIONS (SAVES MASSIVE MOBILE SPACE) */}
      <div className="bg-[#111319] border border-white/10 rounded-2xl p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-brand font-medium text-sm sm:text-lg text-white tracking-[0.1em] uppercase">
              QUINTETO IDEAL
            </h2>
            <span className="text-[10px] text-gray-400 block sm:hidden">
              Toca o arrastra a la cancha
            </span>
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

        {/* 5 FORMATION BUTTONS: HORIZONTAL SWIPE ON MOBILE */}
        <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold mr-1 flex-shrink-0">
            Esquema:
          </span>
          {FUTSAL_FORMATIONS.map(formation => {
            const isSelected = selectedFormationId === formation.id;
            return (
              <button
                key={formation.id}
                onClick={() => handleSelectFormation(formation.id)}
                className={`py-1 px-2.5 rounded-lg border text-center transition-all flex-shrink-0 ${
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

      {/* TWO COLUMNS: COMPACT PITCH + CANDIDATES (STACKED RESPONSIBLY) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* COMPACT FUTSAL COURT (FITS RIGHT IN VIEW ON MOBILE) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div 
            className="w-full max-w-[340px] sm:max-w-[420px] aspect-[10/11] sm:aspect-[9/12] bg-[#0c1420] rounded-2xl border border-white/15 relative overflow-hidden p-2.5 select-none shadow-xl"
          >
            {/* Court Markings */}
            <div className="absolute inset-2.5 border border-white/20 rounded-xl pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 border-b border-x border-white/20 rounded-b-xl" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-10 border-t border-x border-white/20 rounded-t-xl" />
            </div>

            {/* Formation Title Badge on Pitch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-white/15 text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-gray-300 pointer-events-none">
              {currentFormation.id} · {currentFormation.name.split(' ')[1] || ''}
            </div>

            {/* 5 POSITION SLOTS / DROP ZONES */}
            {currentFormation.slots.map((slot, index) => {
              const assignedId = players[index];
              const player = assignedId ? nominees.find(n => n.id === assignedId) : null;
              const isActive = activeSlotIndex === index;
              const isDragOver = dragOverSlotIndex === index;

              return (
                <div
                  key={index}
                  ref={el => { slotRefs.current[index] = el; }}
                  style={{ top: slot.topPct, left: slot.leftPct }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
                  onClick={() => setActiveSlotIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlotIndex(index);
                  }}
                  onDragLeave={() => setDragOverSlotIndex(null)}
                  onDrop={(e) => handleDropOnSlot(e, index)}
                >
                  <div className={`relative transition-all duration-150 ${
                    isDragOver || isActive ? 'scale-110' : ''
                  }`}>
                    {/* Pin Box */}
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl p-0.5 flex items-center justify-center transition-all ${
                      isDragOver
                        ? 'bg-gold-500 text-black ring-4 ring-gold-400 shadow-lg'
                        : isActive
                        ? 'bg-gold-500 text-black ring-2 ring-white/60 shadow'
                        : player
                        ? 'bg-[#181B26] border border-gold-500/70 text-white shadow'
                        : 'bg-black/70 border border-dashed border-white/30 text-gray-400 hover:border-white'
                    }`}>
                      <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
                        {player ? (
                          <span className="font-brand font-bold text-[10px] sm:text-[11px] uppercase truncate max-w-full">
                            {player.name.split(' ')[0]}
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Role Tag on Top */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-semibold uppercase tracking-wider bg-black/95 text-gray-300 border border-white/20 whitespace-nowrap shadow">
                      {slot.label}
                    </span>

                    {/* Remove button */}
                    {player && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSlot(index);
                        }}
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]"
                        title="Quitar"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Player Name Tag below pin */}
                  <div className="mt-0.5 text-center max-w-[90px]">
                    <span className={`block text-[9px] sm:text-[10px] font-medium px-1 py-0.2 rounded truncate ${
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

          <p className="mt-2 text-[10px] text-gray-400 text-center">
            💡 Toca o arrastra al jugador hacia la posición.
          </p>
        </div>

        {/* CANDIDATES LIST (2-COLUMNS COMPACT ON MOBILE - CUTS SCROLL IN HALF) */}
        <div className="lg:col-span-6 bg-[#111319] border border-white/10 rounded-2xl p-3 sm:p-4">
          <div className="pb-2.5 border-b border-white/10 mb-2.5 flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-semibold block">
                Asignando:
              </span>
              <h3 className="font-brand text-xs sm:text-sm font-semibold text-white uppercase flex items-center space-x-1">
                <span className="text-gold-400">#{activeSlotIndex + 1}</span>
                <span>{currentFormation.slots[activeSlotIndex]?.label}</span>
              </h3>
            </div>

            {/* Compact search */}
            <div className="w-36 sm:w-48">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px] placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* CANDIDATES GRID: 2 COLUMNS ON MOBILE, QUICK TAP / DRAG */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-[380px] sm:max-h-[460px] overflow-y-auto pr-1">
            {filteredCandidates.map((nominee) => {
              const isAssignedHere = players[activeSlotIndex] === nominee.id;
              const assignedSlotIndex = players.indexOf(nominee.id);
              const isAssignedElsewhere = assignedSlotIndex !== -1 && assignedSlotIndex !== activeSlotIndex;

              return (
                <div
                  key={nominee.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, nominee.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(nominee, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handleAssignSlot(activeSlotIndex, nominee.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-between select-none cursor-pointer active:scale-95 ${
                    isAssignedHere
                      ? 'bg-[#181B26] border-gold-500 shadow'
                      : isAssignedElsewhere
                      ? 'bg-transparent border-white/5 opacity-50'
                      : 'bg-transparent border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
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
                      <span className="w-5 h-5 rounded-md bg-gold-500 text-black flex items-center justify-center">
                        <UserCheck className="w-3 h-3" />
                      </span>
                    ) : isAssignedElsewhere ? (
                      <span className="text-[8px] text-gray-400 px-1 py-0.2 rounded bg-white/5">
                        {currentFormation.slots[assignedSlotIndex]?.label.slice(0, 4)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-400 hover:text-white uppercase font-bold">
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
