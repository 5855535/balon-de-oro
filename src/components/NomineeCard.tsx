import React from 'react';
import { Nominee } from '../types';
import { Shield, Check, Plus, Trash2 } from 'lucide-react';

interface NomineeCardProps {
  nominee: Nominee;
  rank?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  actionLabel?: string;
  disabled?: boolean;
  nextRankToAssign?: number;
}

export const NomineeCard: React.FC<NomineeCardProps> = ({
  nominee,
  rank,
  isSelected = false,
  onSelect,
  onRemove,
  actionLabel = 'Votar',
  disabled = false,
  nextRankToAssign,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer select-none ${
        isSelected
          ? 'bg-[#151822] border border-gold-500/70 shadow-md'
          : 'bg-[#111319] border border-white/10 hover:border-gold-500/40 hover:bg-[#141720]'
      }`}
    >
      {/* Subtle top indicator if selected */}
      {isSelected && (
        <div className="h-0.5 w-full bg-gold-500" />
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Optional Player Photo if uploaded */}
          {nominee.photoUrl && (
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-black/50 border border-white/10">
              <img
                src={nominee.photoUrl}
                alt={nominee.name}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Top Row: Team + Rank */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs text-gold-400/90 font-medium tracking-wider uppercase truncate">
              <Shield className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
              <span className="truncate">{nominee.team}</span>
            </div>

            {/* Rank Badge if in Top */}
            {rank !== undefined && rank !== null ? (
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-black font-brand font-bold text-xs">
                  #{rank}
                </span>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-rose-400 transition-colors"
                    title="Quitar del Top"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : nextRankToAssign ? (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gold-400 font-semibold bg-white/5 px-2 py-0.5 rounded">
                + Asignar #{nextRankToAssign}
              </span>
            ) : null}
          </div>

          {/* Player Nameplate */}
          <div className="mt-1 mb-2">
            <h3 className="font-brand text-base sm:text-lg font-medium text-white tracking-[0.08em] uppercase group-hover:text-gold-300 transition-colors leading-tight">
              {nominee.name}
            </h3>
            {nominee.nickname && (
              <span className="text-xs text-gold-400/80 font-normal italic block mt-0.5">
                "{nominee.nickname}"
              </span>
            )}
          </div>

          {/* Position Tag if present */}
          {nominee.position && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-white/5 text-gray-400 border border-white/5 mt-1">
              {nominee.position}
            </span>
          )}

          {/* Highlight/Description */}
          {nominee.description && (
            <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed border-t border-white/5 pt-2.5">
              {nominee.description}
            </p>
          )}
        </div>

        {/* Bottom Fast-Tap Indicator */}
        <div className="mt-4 pt-3 border-t border-white/5">
          {isSelected ? (
            <div className="w-full py-2 px-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center justify-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-gold-400" />
              <span>En tu Top (#{rank})</span>
            </div>
          ) : (
            <div
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 ${
                disabled
                  ? 'bg-white/5 text-gray-500'
                  : 'bg-white/5 group-hover:bg-gold-500 group-hover:text-black text-gray-300 group-hover:font-bold'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{nextRankToAssign ? `Tocar para puesto #${nextRankToAssign}` : actionLabel}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
