'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  Clock,
  Calendar,
  Bookmark,
  CheckCircle2,
  Tv,
  Share2,
  RotateCw,
  Film,
  Sparkles,
  Info,
} from 'lucide-react';
import { Movie } from '@/types/movie';
import { Country } from '@/types/country';
import {
  isMovieInGuestWatchlist,
  addToGuestWatchlist,
  removeFromGuestWatchlist,
  isMovieInGuestWatched,
  markAsGuestWatched,
} from '@/lib/guest/guestStorage';
import { StreamingAvailabilityModal } from './StreamingAvailabilityModal';
import { MarkWatchedModal } from './MarkWatchedModal';

interface MovieRevealModalProps {
  movie: Movie | null;
  country: { code: string; name: string; flagEmoji: string } | null;
  filterMatchSummary?: string;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  viewingRegion?: string;
}

export const MovieRevealModal: React.FC<MovieRevealModalProps> = ({
  movie,
  country,
  filterMatchSummary,
  isOpen,
  onClose,
  onSpinAgain,
  viewingRegion = 'US',
}) => {
  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [showStreamingModal, setShowStreamingModal] = useState<boolean>(false);
  const [showMarkWatchedModal, setShowMarkWatchedModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    if (movie) {
      setIsWatchlisted(isMovieInGuestWatchlist(movie.externalId || movie.id));
      setIsWatched(isMovieInGuestWatched(movie.externalId || movie.id));
    }
  }, [movie, isOpen]);

  if (!isOpen || !movie) return null;

  const handleToggleWatchlist = () => {
    if (isWatchlisted) {
      removeFromGuestWatchlist(movie.externalId || movie.id);
      setIsWatchlisted(false);
    } else {
      addToGuestWatchlist(movie);
      setIsWatchlisted(true);
    }
  };

  const handleMarkWatchedSaved = (rating?: number, watchedDate?: string) => {
    markAsGuestWatched(movie, rating, watchedDate, true);
    setIsWatched(true);
    setIsWatchlisted(false);
    setShowMarkWatchedModal(false);
  };

  const handleShare = async () => {
    const text = `I just discovered "${movie.title}" (${movie.releaseYear}) from ${country?.name || movie.productionCountries.join(', ')} on CineGlobe!`;
    const url = typeof window !== 'undefined' ? window.location.href : 'https://cineglobe.vercel.app';

    if (navigator.share) {
      try {
        await navigator.share({ title: movie.title, text, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Ignored
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-300">
        <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-gold bg-[#0c0d12]/95 border border-[#d4af37]/30 shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-zinc-400 hover:text-white hover:bg-black/80 transition-all border border-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Backdrop Image Header if available */}
            {movie.backdropUrl && (
              <div className="relative w-full h-44 sm:h-56 bg-zinc-900 overflow-hidden">
                <img
                  src={movie.backdropUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-40 filter saturate-120"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/60 to-transparent" />

                {/* Country Landing Badge */}
                <div className="absolute bottom-4 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-gold text-xs font-semibold text-white border border-[#d4af37]/40 shadow-lg">
                  <span className="text-base">{country?.flagEmoji}</span>
                  <span>Discovered in <strong className="text-[#e5c07b]">{country?.name}</strong></span>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-7 space-y-6">
              {/* Header Info: Poster + Main Details */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Poster */}
                <div className="relative w-28 sm:w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl -mt-8 sm:-mt-12 group">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-950">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 space-y-2">
                  <div className="space-y-0.5">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      {movie.title}
                    </h2>
                    {movie.originalTitle && movie.originalTitle !== movie.title && (
                      <p className="text-sm text-zinc-400 italic font-serif">
                        {movie.originalTitle}
                      </p>
                    )}
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{movie.releaseYear}</span>
                    </span>

                    {movie.runtime > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{movie.runtime} min</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/15 text-[#e5c07b] border border-[#d4af37]/30 uppercase">
                      {movie.originalLanguage.toUpperCase()}
                    </span>

                    {/* Verified Rating */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-semibold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
                      <span className="text-[10px] text-zinc-400 ml-0.5 font-semibold">
                        IMDb
                      </span>
                    </div>
                  </div>

                  {/* Genres */}
                  {movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {movie.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/5 text-zinc-300"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tagline / Synopsis */}
              {movie.tagline && (
                <p className="text-xs italic text-[#e5c07b] border-l-2 border-[#d4af37] pl-3 py-0.5">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Synopsis
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {movie.synopsis || 'No synopsis recorded.'}
                </p>
              </div>

              {/* Director & Cast */}
              {(movie.director || (movie.cast && movie.cast.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {movie.director && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">
                        Director
                      </span>
                      <span className="text-white font-medium">{movie.director}</span>
                    </div>
                  )}
                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">
                        Key Cast
                      </span>
                      <span className="text-zinc-300 font-medium">
                        {movie.cast.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Filter match note - only display when filters had to be relaxed */}
              {filterMatchSummary && filterMatchSummary !== 'Matched all requested filters.' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{filterMatchSummary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Modal Action Bar */}
          <div className="p-4 sm:p-5 border-t border-white/5 bg-[#08090d] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Watchlist Toggle */}
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isWatchlisted
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#e5c07b]'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-[#d4af37]' : ''}`} />
                <span>{isWatchlisted ? 'Watchlisted' : 'Save to Watchlist'}</span>
              </button>

              {/* Mark Watched */}
              <button
                onClick={() => setShowMarkWatchedModal(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isWatched
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isWatched ? 'Watched ✓' : 'Mark Watched'}</span>
              </button>

              {/* Where to Watch */}
              <button
                onClick={() => setShowStreamingModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
                title="View regional OTT availability"
              >
                <Tv className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Where to Watch</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                title="Share this discovery"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              {copiedShare && (
                <span className="text-[11px] text-emerald-400 font-medium">Link Copied!</span>
              )}
            </div>

            {/* Spin Again */}
            <button
              onClick={() => {
                onClose();
                onSpinAgain();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Spin Again</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      <StreamingAvailabilityModal
        movie={movie}
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        defaultRegion={viewingRegion}
      />

      <MarkWatchedModal
        movie={movie}
        isOpen={showMarkWatchedModal}
        onClose={() => setShowMarkWatchedModal(false)}
        onSave={handleMarkWatchedSaved}
      />
    </>
  );
};
