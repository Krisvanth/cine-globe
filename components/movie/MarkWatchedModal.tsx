'use client';

import React, { useState } from 'react';
import { X, Star, Calendar, Check } from 'lucide-react';
import { Movie } from '@/types/movie';

interface MarkWatchedModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rating?: number, watchedDate?: string) => void;
}

export const MarkWatchedModal: React.FC<MarkWatchedModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSave,
}) => {
  const [rating, setRating] = useState<number>(8);
  const [watchedDate, setWatchedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl glass-panel-gold bg-[#0e0f15]/95 border border-[#d4af37]/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 mb-5">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Mark as Watched</h3>
          <p className="text-xs text-zinc-400 line-clamp-1">{movie.title}</p>
        </div>

        <div className="space-y-4">
          {/* Rating Slider & Stars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Personal Rating</span>
              <span className="font-bold text-[#e5c07b] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                <span>{rating} / 10</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Date Watched</span>
            </label>
            <input
              type="date"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(rating, watchedDate)}
              className="flex-1 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
