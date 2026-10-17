'use client';

import React, { useState } from 'react';
import { Country } from '@/types/country';
import { COUNTRIES } from '@/data/countries';
import { Search, Compass, Film } from 'lucide-react';

interface GlobeFallbackProps {
  onSelectCountry: (country: Country) => void;
  selectedCountry?: Country | null;
}

export const GlobeFallback: React.FC<GlobeFallbackProps> = ({
  onSelectCountry,
  selectedCountry,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const continents = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

  const filtered = COUNTRIES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesContinent =
      selectedContinent === 'All' || c.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#e5c07b]">
          <Compass className="w-3.5 h-3.5" />
          <span>World Cinema Atlas (Accessible Mode)</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Select a Country to Spin From
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Explore cinema heritage by region or pick any nation directly to unveil a movie recommendation.
        </p>
      </div>

      {/* Search & Continent Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or code..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Continents */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {continents.map((continent) => (
            <button
              key={continent}
              onClick={() => setSelectedContinent(continent)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedContinent === continent
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-1">
        {filtered.map((country) => {
          const isSelected = selectedCountry?.code === country.code;
          return (
            <button
              key={country.code}
              onClick={() => onSelectCountry(country)}
              className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 group ${
                isSelected
                  ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                  : 'bg-[#0f1118]/80 border-white/5 hover:border-[#d4af37]/40 hover:bg-[#151824]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{country.flagEmoji}</span>
                <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-[#e5c07b]">
                  {country.code}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs group-hover:text-[#e5c07b] transition-colors">
                  {country.name}
                </h4>
                {country.cinemaTradition && (
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                    {country.cinemaTradition}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
