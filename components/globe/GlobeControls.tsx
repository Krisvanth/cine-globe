'use client';

import React from 'react';
import { Sparkles, SlidersHorizontal, RefreshCw, MapPin } from 'lucide-react';
import { Country } from '@/types/country';

interface GlobeControlsProps {
  onSpin: () => void;
  isSpinning: boolean;
  onOpenFilters: () => void;
  activeFilterCount: number;
  selectedCountry?: Country | null;
}

export const GlobeControls: React.FC<GlobeControlsProps> = ({
  onSpin,
  isSpinning,
  onOpenFilters,
  activeFilterCount,
  selectedCountry,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 z-20 pointer-events-auto">
      {/* Selected Country Indicator */}
      {selectedCountry && (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-gold text-xs text-white border border-[#d4af37]/40 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Selected:</span>
          <span className="font-bold text-[#e5c07b]">
            {selectedCountry.flagEmoji} {selectedCountry.name}
          </span>
        </div>
      )}

      {/* Primary Actions Row */}
      <div className="flex items-center gap-3">
        {/* Pre-spin Filter Button */}
        <button
          onClick={onOpenFilters}
          className={`relative p-3 rounded-full glass-panel border transition-all ${
            activeFilterCount > 0
              ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#e5c07b]'
              : 'border-white/10 text-zinc-300 hover:text-white hover:border-white/30'
          }`}
          title="Configure pre-spin filters"
          aria-label="Filter recommendations"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d4af37] text-black font-extrabold text-[10px] flex items-center justify-center shadow-md">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Big Cinematic Spin Button */}
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className={`group relative px-8 py-3.5 rounded-full font-extrabold text-sm tracking-wider uppercase transition-all duration-300 shadow-xl flex items-center justify-center ${
            isSpinning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#d4af37] text-black hover:scale-105 active:scale-95 shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 border border-amber-300'
          }`}
        >
          <span>{isSpinning ? 'Spinning...' : 'Spin the Globe'}</span>
        </button>


      </div>

      <p className="text-[11px] text-zinc-400 tracking-wide font-medium">
        One spin. One country. One movie.
      </p>
    </div>
  );
};
