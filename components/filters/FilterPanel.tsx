'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Search,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { RecommendationFilters } from '@/types/movie';
import { ALL_LANGUAGES } from '@/data/languages';

const TOP_QUICK_LANGUAGES = [
  { code: 'all', label: 'All' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
];

const GENRES = [
  'All',
  'Drama',
  'Comedy',
  'Action',
  'Sci-Fi',
  'Thriller',
  'Horror',
  'Romance',
  'Animation',
  'Mystery',
  'Fantasy',
  'Crime',
  'Adventure',
  'History',
  'War',
  'Documentary',
  'Western',
];

const RELEASE_ERAS = [
  { id: 'all', label: 'All Time', minYear: undefined, maxYear: undefined },
  { id: '2020s', label: '2020s', sublabel: '2020–Now', minYear: 2020, maxYear: 2026 },
  { id: '2010s', label: '2010s', sublabel: '2010–2019', minYear: 2010, maxYear: 2019 },
  { id: '2000s', label: '2000s', sublabel: '2000–2009', minYear: 2000, maxYear: 2009 },
  { id: '1990s', label: '1990s', sublabel: '1990–1999', minYear: 1990, maxYear: 1999 },
  { id: '1980s', label: '1980s', sublabel: '1980–1989', minYear: 1980, maxYear: 1989 },
  { id: '1970s', label: '1970s', sublabel: '1970–1979', minYear: 1970, maxYear: 1979 },
  { id: 'pre1970', label: 'Pre-1970', sublabel: 'Classics', minYear: 1920, maxYear: 1969 },
];

const VIEWING_REGIONS = [
  { code: 'US', label: 'United States (US)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'IN', label: 'India (IN)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'AU', label: 'Australia (AU)' },
  { code: 'FR', label: 'France (FR)' },
  { code: 'DE', label: 'Germany (DE)' },
  { code: 'JP', label: 'Japan (JP)' },
  { code: 'BR', label: 'Brazil (BR)' },
  { code: 'MX', label: 'Mexico (MX)' },
];

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: RecommendationFilters;
  onChangeFilters: (filters: RecommendationFilters) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onClearFilters,
}) => {
  const [langSearch, setLangSearch] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return ALL_LANGUAGES;
    const q = langSearch.toLowerCase().trim();
    return ALL_LANGUAGES.filter(
      (l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const selectedLang = ALL_LANGUAGES.find((l) => l.code === filters.language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl glass-panel-gold bg-[#0d0e14]/95 border border-[#d4af37]/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-bold text-base text-white tracking-wide">
              Pre-Spin Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Genre */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Genre
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const isSelected = (filters.genre || 'All') === g;
                return (
                  <button
                    key={g}
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        genre: g === 'All' ? undefined : g,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4af37] text-black font-semibold'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Original Language (Sleek Searchable Combobox) */}
          <div className="space-y-2.5" ref={langContainerRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Original Language
                </label>
              </div>
              {filters.language && filters.language !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    onChangeFilters({ ...filters, language: undefined });
                    setLangSearch('');
                  }}
                  className="text-[10px] text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Reset to All</span>
                  <X className="w-2.5 h-2.5" />
                </button>
              ) : (
                <span className="text-[10px] text-zinc-500">186 World Languages</span>
              )}
            </div>

            {/* Quick-Pick Popular Language Chips (Crisp 1-row flex) */}
            <div className="flex flex-wrap gap-1.5">
              {TOP_QUICK_LANGUAGES.map((l) => {
                const isSelected = (filters.language || 'all') === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      onChangeFilters({
                        ...filters,
                        language: l.code === 'all' ? undefined : l.code,
                      });
                      setIsLangDropdownOpen(false);
                      setLangSearch('');
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>

            {/* Searchable Combobox Input & Dropdown */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    selectedLang && selectedLang.code !== 'all'
                      ? `Selected: ${selectedLang.label}`
                      : 'Search 186 languages (e.g. Tamil, French, Korean)...'
                  }
                  value={langSearch}
                  onFocus={() => setIsLangDropdownOpen(true)}
                  onChange={(e) => {
                    setLangSearch(e.target.value);
                    setIsLangDropdownOpen(true);
                  }}
                  className="w-full pl-8 pr-16 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#d4af37] transition-all"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {langSearch && (
                    <button
                      type="button"
                      onClick={() => setLangSearch('')}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isLangDropdownOpen ? 'rotate-180 text-[#d4af37]' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Contained, In-Modal Glassmorphic Dropdown List */}
              {isLangDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#0f1118]/95 border border-[#d4af37]/40 shadow-2xl p-1 space-y-0.5 z-30 backdrop-blur-xl">
                  {filteredLanguages.length === 0 ? (
                    <div className="p-3 text-center text-xs text-zinc-500">
                      No languages found for &quot;{langSearch}&quot;
                    </div>
                  ) : (
                    filteredLanguages.map((l) => {
                      const isSelected = (filters.language || 'all') === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            onChangeFilters({
                              ...filters,
                              language: l.code === 'all' ? undefined : l.code,
                            });
                            setIsLangDropdownOpen(false);
                            setLangSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#d4af37]/20 text-[#e5c07b] font-semibold'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{l.label}</span>
                            {l.code !== 'all' && (
                              <span className="text-[10px] text-zinc-500 uppercase font-mono">
                                [{l.code}]
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Currently Selected Pill Banner (if not 'all') */}
            {selectedLang && selectedLang.code !== 'all' && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25 text-[11px] text-[#e5c07b]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#d4af37]" />
                  <span>
                    Selected: <strong>{selectedLang.label}</strong> [{selectedLang.code.toUpperCase()}]
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, language: undefined })}
                  className="hover:text-white ml-2 cursor-pointer p-0.5"
                  title="Remove language filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Release Period / Era */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Release Period / Era
                </label>
              </div>
              {(filters.minYear || filters.maxYear) && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeFilters({ ...filters, minYear: undefined, maxYear: undefined })
                  }
                  className="text-[10px] text-[#d4af37] hover:underline cursor-pointer"
                >
                  Clear Era
                </button>
              )}
            </div>

            {/* Quick Era Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {RELEASE_ERAS.map((era) => {
                const isSelected =
                  filters.minYear === era.minYear && filters.maxYear === era.maxYear;
                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        minYear: era.minYear,
                        maxYear: era.maxYear,
                      })
                    }
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                        : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span className="text-xs font-semibold">{era.label}</span>
                    {era.sublabel && (
                      <span
                        className={`text-[9px] ${
                          isSelected ? 'text-black/70 font-medium' : 'text-zinc-500'
                        }`}
                      >
                        {era.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Year Interval Inputs (e.g. 2010 to 2020) */}
            <div className="flex items-center gap-2 pt-1 bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-[11px] text-zinc-400 whitespace-nowrap">Custom Years:</span>
              <input
                type="number"
                min={1900}
                max={2030}
                placeholder="From (e.g. 2010)"
                value={filters.minYear ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onChangeFilters({ ...filters, minYear: val });
                }}
                className="w-full px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-xs text-zinc-500 font-medium">to</span>
              <input
                type="number"
                min={1900}
                max={2030}
                placeholder="To (e.g. 2020)"
                value={filters.maxYear ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onChangeFilters({ ...filters, maxYear: val });
                }}
                className="w-full px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Discovery Scope: Hidden Gems vs Popular */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Discovery Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  onChangeFilters({
                    ...filters,
                    hiddenGemsOnly: undefined,
                    popularOnly: undefined,
                  })
                }
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  !filters.hiddenGemsOnly && !filters.popularOnly
                    ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]'
                    : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                All Films
              </button>
              <button
                onClick={() =>
                  onChangeFilters({
                    ...filters,
                    hiddenGemsOnly: true,
                    popularOnly: undefined,
                  })
                }
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  filters.hiddenGemsOnly
                    ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]'
                    : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Hidden Gems 💎
              </button>
              <button
                onClick={() =>
                  onChangeFilters({
                    ...filters,
                    popularOnly: true,
                    hiddenGemsOnly: undefined,
                  })
                }
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  filters.popularOnly
                    ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]'
                    : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Celebrated Classics ⭐
              </button>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Minimum Rating
              </label>
              <span className="text-xs font-bold text-[#e5c07b]">
                {filters.minRating ? `${filters.minRating.toFixed(1)} / 10` : 'Any Rating'}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 7.0, 7.5, 8.0, 8.5].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    onChangeFilters({
                      ...filters,
                      minRating: val === 0 ? undefined : val,
                    })
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    (filters.minRating || 0) === val
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]'
                      : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {val === 0 ? 'Any' : `${val}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Runtime */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Maximum Runtime
              </label>
              <span className="text-xs font-bold text-[#e5c07b]">
                {filters.maxRuntime ? `Under ${filters.maxRuntime} min` : 'Any Length'}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 100, 120, 150].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    onChangeFilters({
                      ...filters,
                      maxRuntime: val === 0 ? undefined : val,
                    })
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    (filters.maxRuntime || 0) === val
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]'
                      : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {val === 0 ? 'Any' : `< ${val}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Viewing Region for OTT Lookup */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Your Viewing Region (for Streaming Lookup)
            </label>
            <select
              value={filters.viewingRegion || 'US'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  viewingRegion: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
            >
              {VIEWING_REGIONS.map((r) => (
                <option key={r.code} value={r.code} className="bg-[#0f1118] text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-[#090a0f] flex items-center justify-between">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
