'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { RecommendationFilters } from '@/types/movie';

import { ALL_LANGUAGES } from '@/data/languages';

interface FilterBadgeBarProps {
  filters: RecommendationFilters;
  onRemoveFilter: (key: keyof RecommendationFilters) => void;
  onClearAll: () => void;
}

export const FilterBadgeBar: React.FC<FilterBadgeBarProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const activeBadges: { key: keyof RecommendationFilters; label: string }[] = [];

  if (filters.genre) {
    activeBadges.push({ key: 'genre', label: `Genre: ${filters.genre}` });
  }
  if (filters.language && filters.language !== 'all') {
    const found = ALL_LANGUAGES.find((l) => l.code === filters.language);
    const langName = found ? found.label.split(' ')[0] : filters.language.toUpperCase();
    activeBadges.push({ key: 'language', label: `Lang: ${langName}` });
  }
  if (filters.minRating) {
    activeBadges.push({ key: 'minRating', label: `★ ≥ ${filters.minRating}` });
  }
  if (filters.minYear || filters.maxYear) {
    let eraLabel = 'Era: ';
    if (filters.minYear === 2020 && (!filters.maxYear || filters.maxYear >= 2026)) {
      eraLabel += '2020s';
    } else if (filters.minYear === 2010 && filters.maxYear === 2019) {
      eraLabel += '2010s';
    } else if (filters.minYear === 2000 && filters.maxYear === 2009) {
      eraLabel += '2000s';
    } else if (filters.minYear === 1990 && filters.maxYear === 1999) {
      eraLabel += '1990s';
    } else if (filters.minYear === 1980 && filters.maxYear === 1989) {
      eraLabel += '1980s';
    } else if (filters.minYear === 1970 && filters.maxYear === 1979) {
      eraLabel += '1970s';
    } else if (filters.minYear === 1920 && filters.maxYear === 1969) {
      eraLabel += 'Pre-1970';
    } else if (filters.minYear && filters.maxYear) {
      eraLabel += `${filters.minYear}–${filters.maxYear}`;
    } else if (filters.minYear) {
      eraLabel += `${filters.minYear}+`;
    } else {
      eraLabel += `≤ ${filters.maxYear}`;
    }
    activeBadges.push({ key: 'minYear', label: eraLabel });
  }
  if (filters.maxRuntime) {
    activeBadges.push({ key: 'maxRuntime', label: `≤ ${filters.maxRuntime}m` });
  }
  if (filters.hiddenGemsOnly) {
    activeBadges.push({ key: 'hiddenGemsOnly', label: 'Hidden Gems' });
  } else if (filters.popularOnly) {
    activeBadges.push({ key: 'popularOnly', label: 'Popular Classics' });
  }
  if (filters.viewingRegion && filters.viewingRegion !== 'US') {
    activeBadges.push({ key: 'viewingRegion', label: `Region: ${filters.viewingRegion}` });
  }

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 max-w-xl mx-auto animate-fade-in">
      <span className="text-[11px] font-semibold text-zinc-400 mr-1 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#d4af37]" />
        <span>Active:</span>
      </span>

      {activeBadges.map((b) => (
        <span
          key={b.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#e5c07b]"
        >
          <span>{b.label}</span>
          <button
            onClick={() => onRemoveFilter(b.key)}
            className="hover:text-white p-0.5"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-[11px] text-zinc-400 hover:text-white underline ml-1 cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
};
