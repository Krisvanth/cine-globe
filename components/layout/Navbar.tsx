'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Film,
  Bookmark,
  CheckCircle2,
  User,
  Search,
  Loader2,
  X,
  Star,
  Check,
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  getGuestWatchlist,
  getGuestWatchedFilms,
  markAsGuestWatched,
  syncCloudLibraryWithLocal,
} from '@/lib/guest/guestStorage';
import { Movie } from '@/types/movie';
import { WatchedFilmItem } from '@/types/user';
import { MarkWatchedModal } from '@/components/movie/MarkWatchedModal';
import { MovieRevealModal } from '@/components/movie/MovieRevealModal';
import { getMovieAvatarById } from '@/components/auth/MovieAvatars';
import { getLocalUserProfile, UserProfile } from '@/lib/auth/userProfile';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const pathname = usePathname();
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [watchedCount, setWatchedCount] = useState<number>(0);
  const [watchedFilms, setWatchedFilms] = useState<WatchedFilmItem[]>([]);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  // Search in header state
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [movieToRate, setMovieToRate] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const updateCounts = () => {
    setWatchlistCount(getGuestWatchlist().length);
    const watched = getGuestWatchedFilms();
    setWatchedCount(watched.length);
    setWatchedFilms(watched);
  };

  const updateProfile = () => {
    setLocalProfile(getLocalUserProfile());
  };

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    updateCounts();
    updateProfile();

    window.addEventListener('cineglobe_storage_change', updateCounts);
    window.addEventListener('cineglobe_profile_change', updateProfile);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setUser(data.session.user);
          syncCloudLibraryWithLocal();
        }
      });

      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          syncCloudLibraryWithLocal();
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          syncCloudLibraryWithLocal();
        }
      });

      return () => {
        window.removeEventListener('cineglobe_storage_change', updateCounts);
        window.removeEventListener('cineglobe_profile_change', updateProfile);
        subscription.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('cineglobe_storage_change', updateCounts);
      window.removeEventListener('cineglobe_profile_change', updateProfile);
    };
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced TMDB search for closest matches
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.movies || []);
      } catch (err) {
        console.error('Header movie search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSaveRating = (rating?: number, watchedDate?: string) => {
    if (!movieToRate) return;

    markAsGuestWatched(movieToRate, rating, watchedDate, true);
    updateCounts();

    setMovieToRate(null);
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  const getWatchedInfo = (movie: Movie) => {
    const id = String(movie.externalId || movie.id);
    return watchedFilms.find((item) => String(item.movieExternalId) === id);
  };

  const avatarId =
    user?.user_metadata?.avatar_id || localProfile?.avatarId || null;
  const displayName =
    (user?.user_metadata?.full_name || localProfile?.name || user?.email?.split('@')[0] || 'Cinephile').split(' ')[0];

  const navLinks = [
    { href: '/', label: 'Discover', icon: Globe },
    {
      href: '/watchlist',
      label: 'Watchlist',
      icon: Bookmark,
    },
    {
      href: '/watched',
      label: 'Watched',
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0a0b10]/90 backdrop-blur-xl border border-[#d4af37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-[#d4af37]/50 transition-all duration-300 relative">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group pr-2 sm:pr-3 border-r border-white/10 shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37]/30 via-[#d4af37] to-amber-200 flex items-center justify-center text-black font-bold shadow-sm shadow-[#d4af37]/30 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-3.5 h-3.5 text-black stroke-[2.2]" />
            </div>
            <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white group-hover:text-[#e5c07b] transition-colors">
              CINE<span className="text-[#d4af37]">GLOBE</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="flex items-center gap-1 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-2 sm:px-3 py-1 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/15 shadow-inner border border-white/15'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#d4af37]' : 'text-zinc-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Search Bar */}
          <div ref={searchRef} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-2.5 text-zinc-400 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#d4af37] animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (results.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Search films..."
                className="w-28 sm:w-44 md:w-56 focus:w-48 sm:focus:w-60 md:focus:w-64 pl-8 pr-7 py-1 rounded-full bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all duration-300"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Header Closest Matches Dropdown */}
            {isDropdownOpen && query.trim().length >= 2 && (
              <div className="absolute top-full mt-3 right-0 sm:left-1/2 sm:-translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[420px] rounded-2xl bg-[#0e0f17]/98 border border-[#d4af37]/30 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden flex flex-col z-50">
                <div className="overflow-y-auto divide-y divide-white/5">
                  {isSearching && results.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-[#d4af37] animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No matching films found
                    </div>
                  ) : (
                    results.map((movie) => {
                      const watchedItem = getWatchedInfo(movie);
                      const isWatched = Boolean(watchedItem);

                      return (
                        <div
                          key={movie.id}
                          className="p-3 hover:bg-white/[0.04] transition-colors flex items-center justify-between gap-3 bg-[#0e0f17]"
                        >
                          {/* Thumbnail & Title */}
                          <div
                            onClick={() => {
                              setSelectedMovie(movie);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 group"
                          >
                            <div className="relative w-9 h-12 rounded overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                              {movie.posterUrl ? (
                                <img
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Film className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-white group-hover:text-[#e5c07b] transition-colors truncate">
                                  {movie.title}
                                </h4>
                                {movie.releaseYear && (
                                  <span className="text-[10px] text-zinc-400 shrink-0">
                                    ({movie.releaseYear})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                {movie.rating !== undefined && (
                                  <span className="flex items-center gap-0.5 text-[#e5c07b] font-semibold">
                                    <Star className="w-2.5 h-2.5 fill-[#d4af37] text-[#d4af37]" />
                                    <span>{movie.rating.toFixed(1)}</span>
                                  </span>
                                )}
                                {movie.productionCountries && movie.productionCountries.length > 0 && (
                                  <span className="text-zinc-500 truncate">
                                    • {movie.productionCountries[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Rate & Log Action Button */}
                          <div className="shrink-0 flex items-center gap-1.5">
                            {isWatched ? (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>
                                    {watchedItem?.personalRating
                                      ? `${watchedItem.personalRating}/10`
                                      : 'Watched'}
                                  </span>
                                </span>
                                <button
                                  onClick={() => {
                                    setMovieToRate(movie);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="px-2 py-0.5 rounded border border-white/10 hover:border-[#d4af37] text-zinc-400 hover:text-[#d4af37] text-[10px] transition-colors font-medium"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setMovieToRate(movie);
                                  setIsDropdownOpen(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#d4af37] hover:bg-[#e5c07b] text-black font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm active:scale-95"
                              >
                                <Star className="w-3 h-3 fill-black" />
                                <span>Rate & Log</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Action (User Profile / Sign In) */}
          <div className="pl-1 sm:pl-2 border-l border-white/10 shrink-0">
            {user || localProfile?.isLoggedIn ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border border-[#d4af37]/40 bg-[#0c0d14]/90 text-[#e5c07b] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all cursor-pointer shadow-sm"
                title={`Signed in as ${displayName}`}
              >
                {avatarId ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-[#d4af37]/50 shadow-sm shrink-0">
                    {getMovieAvatarById(avatarId).render(20)}
                  </div>
                ) : user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt="Avatar"
                    className="w-4 h-4 rounded-full object-cover border border-[#d4af37]/60"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 text-[#e5c07b] flex items-center justify-center text-[9px] font-bold">
                    {displayName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-white">
                  {displayName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#e5c07b] hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Movie Details Modal from Header Search */}
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

      {/* Rate & Log Modal from Header Search */}
      {movieToRate && (
        <MarkWatchedModal
          movie={movieToRate}
          isOpen={Boolean(movieToRate)}
          onClose={() => setMovieToRate(null)}
          onSave={handleSaveRating}
        />
      )}
    </>
  );
};

