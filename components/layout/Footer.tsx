import React from 'react';
import { Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#050608]/90 text-zinc-400 text-xs py-3.5 transition-colors">
      <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center space-y-1.5">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Film className="w-2.5 h-2.5" />
          </div>
          <span className="font-bold tracking-wider text-xs text-white">
            CINE<span className="text-[#d4af37]">GLOBE</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-zinc-400 leading-snug text-[11px] max-w-md">
          One spin. One country. One movie. An immersive gateway designed for cinephiles and curious viewers who struggle to choose what to watch next.
        </p>

        {/* Dedication */}
        <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
          <span>Made with dedication to global storytelling</span>
          <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500 inline" />
        </div>
      </div>
    </footer>
  );
};
