'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobeControls } from '@/components/globe/GlobeControls';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { FilterBadgeBar } from '@/components/filters/FilterBadgeBar';
import { MovieRevealModal } from '@/components/movie/MovieRevealModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { Country } from '@/types/country';
import { Movie, RecommendationFilters, DiscoverResponse } from '@/types/movie';
import { COUNTRIES, getCountryByCode, getCountriesForLanguage } from '@/data/countries';
import { Compass, Sparkles, Film, ArrowDown, ShieldCheck } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getLocalUserProfile } from '@/lib/auth/userProfile';

// Dynamically import 3D Three.js GlobeScene to prevent SSR hydration mismatches
const GlobeScene = dynamic(
  () => import('@/components/globe/GlobeScene').then((mod) => mod.GlobeScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] sm:min-h-[580px] flex flex-col items-center justify-center text-zinc-500 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">
          Initializing 3D World Cinema Engine...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Auth gate: redirect to /login if not logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Remove deprecated guest session if present
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cineglobe_guest_session');
      }

      const localProfile = getLocalUserProfile();
      if (localProfile?.isLoggedIn) return;

      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return;
      }

      router.push('/login');
    };

    checkAuthStatus();
  }, [router]);

  // Filters State
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<RecommendationFilters>({
    viewingRegion: 'US',
  });

  // Movie Reveal State
  const [revealedMovie, setRevealedMovie] = useState<Movie | null>(null);
  const [revealedCountry, setRevealedCountry] = useState<{
    code: string;
    name: string;
    flagEmoji: string;
  } | null>(null);
  const [filterMatchSummary, setFilterMatchSummary] = useState<string>('');
  const [revealModalOpen, setRevealModalOpen] = useState<boolean>(false);

  // Session shown exclusions (prevent immediate repetition on successive spins)
  const [sessionExcludedIds, setSessionExcludedIds] = useState<string[]>([]);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Country selector modal
  const [countrySelectorOpen, setCountrySelectorOpen] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>('');

  // Count active filters (excluding default viewingRegion)
  const activeFilterCount = Object.keys(filters).filter((k) => {
    if (k === 'viewingRegion') return false;
    if (k === 'maxYear' && filters.minYear !== undefined) return false;
    return filters[k as keyof RecommendationFilters] !== undefined;
  }).length;

  const handleRemoveFilter = (key: keyof RecommendationFilters) => {
    const updated = { ...filters };
    delete updated[key];
    if (key === 'minYear' || key === 'maxYear') {
      delete updated.minYear;
      delete updated.maxYear;
    }
    setFilters(updated);
  };

  const handleClearAllFilters = () => {
    setFilters({ viewingRegion: filters.viewingRegion || 'US' });
  };

  // Trigger Spin Action
  const handleTriggerSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRevealModalOpen(false);

    // Pick a country randomly from countries matching the active language filter
    const candidates = getCountriesForLanguage(filters.language);
    const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
    setSelectedCountry(randomPick);
  };

  // Called when Globe finishes camera deceleration & landing
  const handleLandCountry = useCallback(
    async (country: Country) => {
      setIsSpinning(false);
      setSelectedCountry(country);

      try {
        const res = await fetch('/api/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryCode: country.code,
            filters,
            excludeIds: sessionExcludedIds,
          }),
        });

        if (res.ok) {
          const data: DiscoverResponse = await res.json();
          setRevealedMovie(data.movie);
          setRevealedCountry(data.country);
          setFilterMatchSummary(data.filterMatchSummary);
          setRevealModalOpen(true);

          // Add to session exclusions
          setSessionExcludedIds((prev) => [...prev, data.movie.id]);
        }
      } catch (err) {
        console.error('Failed to discover movie:', err);
      }
    },
    [filters, sessionExcludedIds]
  );

  // Handle direct country selection from selector modal: smoothly spin 3D globe to country
  const handleSelectCountryDirectly = (country: Country) => {
    setCountrySelectorOpen(false);
    setSelectedCountry(country);
    setIsSpinning(true);
  };

  const candidateCountries = getCountriesForLanguage(filters.language);
  const filteredCountriesForModal = candidateCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-white selection:bg-[#d4af37] selection:text-black">
      {/* Navigation */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Discover Hero */}
      <main className="relative flex-1 min-h-screen w-full flex flex-col items-center justify-between overflow-hidden">
        {/* Full-bleed 3D Globe & Starfield Canvas */}
        <div className="absolute inset-0 w-full h-full z-0">
          <GlobeScene
            selectedCountry={selectedCountry}
            onLandCountry={handleLandCountry}
            isSpinning={isSpinning}
          />
        </div>

        {/* Floating Top - Clean view preserving full focus on 3D globe */}
        <div className="relative z-10 text-center max-w-2xl mx-auto pt-16 sm:pt-20 px-4 pointer-events-none">
          <h1 className="sr-only">CineGlobe — One Spin. One Country. One Movie.</h1>
          <div className="pointer-events-auto">
            <FilterBadgeBar
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </div>

        {/* Floating Bottom Controls */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-3 pb-8 px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <GlobeControls
              onSpin={handleTriggerSpin}
              isSpinning={isSpinning}
              onOpenFilters={() => setFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
              selectedCountry={selectedCountry}
            />
          </div>

          <button
            onClick={() => setCountrySelectorOpen(true)}
            className="pointer-events-auto text-[11px] text-zinc-400 hover:text-[#e5c07b] transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10"
          >
            <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Or select a specific country from the list</span>
          </button>
        </div>
      </main>

      {/* Pre-Spin Filter Drawer Modal */}
      <FilterPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChangeFilters={(f) => setFilters(f)}
        onClearFilters={handleClearAllFilters}
      />

      {/* Movie Reveal Modal */}
      <MovieRevealModal
        movie={revealedMovie}
        country={revealedCountry}
        filterMatchSummary={filterMatchSummary}
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
        onSpinAgain={handleTriggerSpin}
        viewingRegion={filters.viewingRegion || 'US'}
      />

      {/* Auth / Account Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Searchable Country Selector Modal */}
      {countrySelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl glass-panel-gold bg-[#0e0f15]/95 border border-[#d4af37]/30 p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-bold text-sm text-white">Select a Nation</h3>
              <button
                onClick={() => setCountrySelectorOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search by country or code..."
              className="my-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredCountriesForModal.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelectCountryDirectly(c)}
                  className="w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flagEmoji}</span>
                    <span className="font-semibold text-white group-hover:text-[#e5c07b]">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">
                    {c.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
