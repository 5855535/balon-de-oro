import React from 'react';
import { CATEGORIES, AwardCategory } from '../types';

interface HeroBannerProps {
  category: AwardCategory;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ category }) => {
  const current = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div className="relative py-12 sm:py-16 overflow-hidden bg-[#090A0D] border-b border-white/10">
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle Category Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold-400 text-[11px] tracking-[0.25em] uppercase font-semibold mb-4">
          <span>{current.tag}</span>
        </div>

        {/* Main Title in official Ballon d'Or Brand Typography */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-brand font-light tracking-[0.16em] uppercase mb-3 text-white">
          {current.title}
        </h1>

        {/* Subtitle */}
        <h2 className="text-sm sm:text-base font-normal tracking-wide text-gold-400 max-w-2xl mx-auto mb-2 uppercase">
          {current.subtitle}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gala-muted max-w-xl mx-auto leading-relaxed">
          {current.description}
        </p>

        {/* Sub points explanation for ranking */}
        {category === 'ballon_dor' && (
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-[11px] text-gray-300">
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">1º: 15 pts</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">2º: 12 pts</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">3º: 10 pts</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">4º: 8 pts</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">5º: 7 pts</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">6º al 10º: 5, 4, 3, 2, 1 pt</span>
          </div>
        )}
      </div>
    </div>
  );
};
