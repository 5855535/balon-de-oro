import React from 'react';
import { CATEGORIES, AwardCategory } from '../types';
import { Trophy, ShieldCheck, Users, Flame, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryTabsProps {
  activeTab: AwardCategory;
  onSelectTab: (cat: AwardCategory) => void;
}

const CATEGORY_ICONS: Record<AwardCategory, React.ElementType> = {
  ballon_dor: Trophy,
  guante_oro: ShieldCheck,
  quinteto_ideal: Users,
  goleador: Flame,
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onSelectTab }) => {
  const { userBallot } = useApp();

  const isVoted = (cat: AwardCategory) => {
    if (cat === 'ballon_dor') return (userBallot.ballon_dor?.length || 0) > 0;
    if (cat === 'guante_oro') return (userBallot.guante_oro?.length || 0) > 0;
    if (cat === 'quinteto_ideal') return !!userBallot.quinteto_ideal;
    if (cat === 'goleador') return (userBallot.goleador?.length || 0) > 0;
    return false;
  };

  return (
    <div className="w-full border-b border-white/10 bg-[#0B0D12] sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-6 overflow-x-auto py-2 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isActive = activeTab === cat.id;
            const completed = isVoted(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectTab(cat.id)}
                className={`flex-shrink-0 group relative py-3.5 px-3 sm:px-4 transition-all duration-200 flex items-center space-x-2.5 text-left border-b-2 ${
                  isActive
                    ? 'border-gold-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-gold-400 bg-white/5' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs sm:text-sm font-brand tracking-[0.12em] uppercase ${
                    isActive ? 'font-medium text-white' : 'font-normal text-gray-400 group-hover:text-white'
                  }`}>
                    {cat.title}
                  </span>
                  {completed && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]" title="Voto guardado">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
