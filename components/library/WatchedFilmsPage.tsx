'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Star,
  Trash2,
  Calendar,
  Film,
  Globe,
  Search,
} from 'lucide-react';
import { WatchedFilmItem } from '@/types/user';
import {
  getGuestWatchedFilms,
  removeFromGuestWatched,
  syncCloudLibraryWithLocal,
} from '@/lib/guest/guestStorage';
import { Movie } from '@/types/movie';
import { MovieRevealModal } from '@/components/movie/MovieRevealModal';

export const WatchedFilmsPage: React.FC = () => {
  const [items, setItems] = useState<WatchedFilmItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const loadItems = () => {
    setItems(getGuestWatchedFilms());
  };

  useEffect(() => {
    loadItems();
    syncCloudLibraryWithLocal();
    window.addEventListener('cineglobe_storage_change', loadItems);
    return () => {
      window.removeEventListener('cineglobe_storage_change', loadItems);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, externalId: string | number) => {
    e.stopPropagation();
    removeFromGuestWatched(externalId);
    loadItems();
  };

  // Compute unique countries explored
  const uniqueCountries = new Set<string>();
  items.forEach((item) => {
    item.movieSnapshot?.productionCountries?.forEach((c) => uniqueCountries.add(c));
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Watched Films
          </h1>
        </div>
      </div>

      {/* Grid of Watched Movies */}
      {items.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl glass-panel p-8 border border-white/5">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No watched films recorded yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Search any film in the top header bar to rate and log it, or spin the globe to discover world cinema.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#e5c07b] transition-all shadow-lg"
          >
            <Globe className="w-4 h-4" />
            <span>Discover Movies</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            const movie = item.movieSnapshot;
            if (!movie) return null;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMovie(movie)}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-500/50 transition-all duration-300 flex flex-col cursor-pointer bg-[#0c0d12]"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  {/* Personal Rating Badge if provided */}
                  {item.personalRating !== undefined && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      <span>{item.personalRating} / 10</span>
                    </div>
                  )}

                  {/* Production Country */}
                  {movie.productionCountries && movie.productionCountries.length > 0 && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold">
                      {movie.productionCountries.join(', ')}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>Watched {item.watchedAt}</span>
                    </div>
                  </div>

                  {/* Remove action */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[10px] text-zinc-500">
                      Release: {movie.releaseYear || 'N/A'}
                    </span>
                    <button
                      onClick={(e) => handleRemove(e, item.movieExternalId)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove from watched history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieRevealModal
          movie={selectedMovie}
          country={null}
          isOpen={Boolean(selectedMovie)}
          onClose={() => setSelectedMovie(null)}
          onSpinAgain={() => {
            setSelectedMovie(null);
            window.location.href = '/';
          }}
        />
      )}
    </div>
  );
};



