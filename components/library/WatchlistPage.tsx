'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, CheckCircle2, Star, Film, Globe, Search, ArrowRight } from 'lucide-react';
import { WatchlistItem } from '@/types/user';
import {
  getGuestWatchlist,
  removeFromGuestWatchlist,
  syncCloudLibraryWithLocal,
} from '@/lib/guest/guestStorage';
import { Movie } from '@/types/movie';
import { MovieRevealModal } from '@/components/movie/MovieRevealModal';
import { MarkWatchedModal } from '@/components/movie/MarkWatchedModal';
import { markAsGuestWatched } from '@/lib/guest/guestStorage';

export const WatchlistPage: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'year'>('date');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieToMarkWatched, setMovieToMarkWatched] = useState<Movie | null>(null);

  const loadItems = () => {
    setItems(getGuestWatchlist());
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
    removeFromGuestWatchlist(externalId);
    loadItems();
  };

  const handleMarkWatchedSaved = (rating?: number, watchedDate?: string) => {
    if (!movieToMarkWatched) return;
    markAsGuestWatched(movieToMarkWatched, rating, watchedDate, true);
    setMovieToMarkWatched(null);
    loadItems();
  };

  const filteredItems = items
    .filter((item) => {
      const title = item.movieSnapshot?.title || '';
      return title.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.movieSnapshot?.rating || 0) - (a.movieSnapshot?.rating || 0);
      }
      if (sortBy === 'year') {
        return (b.movieSnapshot?.releaseYear || 0) - (a.movieSnapshot?.releaseYear || 0);
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            My Watchlist
          </h1>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search watchlist..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs focus:outline-none focus:border-[#d4af37]"
          >
            <option value="date" className="bg-[#0f1118]">Recently Added</option>
            <option value="rating" className="bg-[#0f1118]">Highest Rated</option>
            <option value="year" className="bg-[#0f1118]">Release Year</option>
          </select>
        </div>
      </div>

      {/* Grid of Saved Movies */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl glass-panel p-8 border border-white/5">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your watchlist is empty</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Spin the interactive 3D Earth, explore international cinema, and save films to watch later.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#e5c07b] transition-all shadow-lg"
          >
            <Globe className="w-4 h-4" />
            <span>Spin the Globe</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const movie = item.movieSnapshot;
            if (!movie) return null;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMovie(movie)}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col cursor-pointer bg-[#0c0d12]"
              >
                {/* Poster Container */}
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

                  {/* Rating Tag */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>

                  {/* Countries badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold">
                    {movie.productionCountries.join(', ')}
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-xs group-hover:text-[#e5c07b] transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      {movie.releaseYear} • {movie.genres.slice(0, 2).join(', ')}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovieToMarkWatched(movie);
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      title="Mark as watched"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Watched</span>
                    </button>

                    <button
                      onClick={(e) => handleRemove(e, item.movieExternalId)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove from watchlist"
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

      {/* Mark Watched Modal */}
      {movieToMarkWatched && (
        <MarkWatchedModal
          movie={movieToMarkWatched}
          isOpen={Boolean(movieToMarkWatched)}
          onClose={() => setMovieToMarkWatched(null)}
          onSave={handleMarkWatchedSaved}
        />
      )}
    </div>
  );
};
