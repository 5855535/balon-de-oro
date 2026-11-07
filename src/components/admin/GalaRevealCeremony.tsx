import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AwardCategory, CATEGORIES } from '../../types';
import { Trophy, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GalaRevealProps {
  onClose: () => void;
}

export const GalaRevealCeremony: React.FC<GalaRevealProps> = ({ onClose }) => {
  const { calculateStandings, calculateQuintetoIdeal } = useApp();
  const [selectedAward, setSelectedAward] = useState<AwardCategory>('ballon_dor');
  const [currentRankIndex, setCurrentRankIndex] = useState<number>(9);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const standings = calculateStandings(selectedAward);
  const quinteto = calculateQuintetoIdeal();

  const handleNextReveal = () => {
    if (selectedAward === 'quinteto_ideal') return;
    
    if (currentRankIndex >= 0) {
      const nomineeToReveal = standings[currentRankIndex];
      if (nomineeToReveal) {
        setRevealedIds(prev => [...prev, nomineeToReveal.nominee.id]);
      }
      
      if (currentRankIndex === 0) {
        // Winner revealed! Big celebration
        confetti({
          particleCount: 220,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFF0B8', '#F59E0B', '#ffffff'],
        });
      }

      setCurrentRankIndex(prev => prev - 1);
    }
  };

  const handleResetReveal = () => {
    setCurrentRankIndex(selectedAward === 'ballon_dor' ? Math.min(9, standings.length - 1) : Math.min(2, standings.length - 1));
    setRevealedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060709] text-white flex flex-col justify-between overflow-hidden p-6 sm:p-10 select-none">
      
      {/* Top Gala Bar */}
      <div className="flex items-center justify-between border-b border-gold-500/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gold-500/20 border border-gold-500/40 p-1 flex items-center justify-center">
            <img src="/images.png" alt="" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-widest gold-gradient-text uppercase">
              CEREMONIA OFICIAL DE REVELACIÓN
            </h2>
            <p className="text-[11px] text-gold-400/70 tracking-widest uppercase">
              Gala Balón de Oro Futsal · Modo Proyector
            </p>
          </div>
        </div>

        {/* Category switcher */}
        <div className="flex items-center space-x-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedAward(cat.id);
                setRevealedIds([]);
                setCurrentRankIndex(cat.id === 'ballon_dor' ? 9 : 2);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedAward === cat.id
                  ? 'bg-gold-500 text-black shadow-gold-glow'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors ml-4"
            title="Salir del modo gala"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 relative">
        
        {/* Ambient spotlight */}
        <div className="absolute w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none" />

        {selectedAward === 'quinteto_ideal' ? (
          /* Quinteto Ideal Stage */
          <div className="w-full max-w-4xl text-center space-y-6">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold gold-gradient-text uppercase tracking-widest">
              EL QUINTETO IDEAL DE LA TEMPORADA
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { title: 'PORTERO', item: quinteto.gk },
                { title: 'JUGADOR 1', item: quinteto.cierre },
                { title: 'JUGADOR 2', item: quinteto.alas[0] },
                { title: 'JUGADOR 3', item: quinteto.alas[1] },
                { title: 'JUGADOR 4', item: quinteto.pivot },
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="bg-gala-card border border-gold-500/40 rounded-2xl p-4 flex flex-col items-center shadow-gold-glow transform hover:scale-105 transition-all"
                >
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2">
                    {pos.title}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-black/80 border-2 border-gold-400 p-2 flex items-center justify-center mb-3 shadow-md">
                    <img src="/images.png" alt="" className="w-full h-full object-contain filter drop-shadow" />
                  </div>
                  <h4 className="font-display font-black text-white text-xs sm:text-sm uppercase truncate max-w-full">
                    {pos.item ? pos.item.nominee.name : 'Por definir'}
                  </h4>
                  <p className="text-[10px] text-gold-300 truncate max-w-full">
                    {pos.item ? pos.item.nominee.team : ''}
                  </p>
                  <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-bold">
                    {pos.item ? `${pos.item.votes} votos` : '0 votos'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Ranking Reveal Stage (Top 10 / Top 3) */
          <div className="w-full max-w-5xl flex flex-col items-center">
            
            {/* Top banner */}
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-bold block mb-1">
                CLASIFICACIÓN OFICIAL
              </span>
              <h3 className="font-display text-4xl sm:text-5xl font-black gold-gradient-text uppercase tracking-wide">
                {selectedAward === 'ballon_dor' ? "Ballon d'Or" : selectedAward === 'guante_oro' ? 'Guante de Oro' : 'Mejor Goleador'}
              </h3>
            </div>

            {/* Winner spotlight if reached top 1 */}
            {revealedIds.includes(standings[0]?.nominee.id) ? (
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-black/90 border-4 border-gold-400 shadow-gold-glow-lg mx-auto p-4 flex items-center justify-center">
                    <img
                      src="/images.png"
                      alt=""
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold-500 to-amber-200 text-black font-black text-sm uppercase tracking-widest shadow-lg whitespace-nowrap">
                    🏆 GANADOR OFICIAL
                  </div>
                </div>

                <h2 className="mt-6 font-display text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">
                  {standings[0]?.nominee.name}
                </h2>
                <p className="text-sm font-semibold text-gold-400 uppercase tracking-widest mt-1">
                  {standings[0]?.nominee.team} · {standings[0]?.points} Puntos Totales
                </p>
              </div>
            ) : null}

            {/* List of revealed items */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-2">
              {standings.map((item, index) => {
                const isRevealed = revealedIds.includes(item.nominee.id);
                if (!isRevealed) {
                  return (
                    <div
                      key={item.nominee.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-between text-gray-600"
                    >
                      <span className="font-display font-bold text-sm">#{index + 1}</span>
                      <span className="text-xs tracking-wider uppercase font-semibold">??? Por revelar</span>
                      <span className="text-xs">??? pts</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.nominee.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      index === 0
                        ? 'bg-gradient-to-r from-gold-500/30 to-gala-black border-gold-400 shadow-gold-glow'
                        : index < 3
                        ? 'bg-gala-card border-gold-500/30'
                        : 'bg-gala-black/80 border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                        index === 0 ? 'bg-gold-500 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 p-1 flex items-center justify-center flex-shrink-0">
                        <img src="/images.png" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate">
                        <p className="font-display font-black text-xs text-white uppercase truncate">
                          {item.nominee.name}
                        </p>
                        <p className="text-[10px] text-gold-400 truncate">
                          {item.nominee.team}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-gold-300 px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
                      {item.points} pts
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between border-t border-gold-500/20 pt-4">
        <button
          onClick={handleResetReveal}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 uppercase tracking-wider font-semibold transition-colors"
        >
          Reiniciar Revelación
        </button>

        {selectedAward !== 'quinteto_ideal' && (
          <button
            onClick={handleNextReveal}
            disabled={currentRankIndex < 0}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-200 text-black font-extrabold text-sm uppercase tracking-widest hover:brightness-110 shadow-gold-glow transition-all flex items-center space-x-2 disabled:opacity-40"
          >
            <span>
              {currentRankIndex >= 0
                ? `Revelar Puesto #${currentRankIndex + 1}`
                : '¡Podio Completado!'}
            </span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
