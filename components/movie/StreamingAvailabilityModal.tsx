'use client';

import React, { useState, useEffect } from 'react';
import { X, Tv, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { Movie, RegionalStreamingAvailability } from '@/types/movie';

interface StreamingAvailabilityModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  defaultRegion?: string;
}

const REGIONS = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'IN', label: 'India' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Germany' },
];

export const StreamingAvailabilityModal: React.FC<StreamingAvailabilityModalProps> = ({
  movie,
  isOpen,
  onClose,
  defaultRegion = 'US',
}) => {
  const [region, setRegion] = useState<string>(defaultRegion);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RegionalStreamingAvailability | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchStream = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?id=${movie.externalId || movie.id}&region=${region}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json.availability);
        } else {
          // Local fallback from movie object if available
          const local = movie.streaming?.[region] || null;
          if (isMounted) setData(local);
        }
      } catch {
        const local = movie.streaming?.[region] || null;
        if (isMounted) setData(local);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStream();
    return () => {
      isMounted = false;
    };
  }, [isOpen, movie, region]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-gold bg-[#0e0f15]/95 border border-[#d4af37]/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Where to Watch</h3>
            <p className="text-xs text-zinc-400 line-clamp-1">{movie.title}</p>
          </div>
        </div>

        {/* Region Selector */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">
            Select Viewing Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code} className="bg-[#0f1118] text-white">
                {r.label} ({r.code})
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#d4af37]" />
            <span>Checking regional availability...</span>
          </div>
        ) : data && data.offers && data.offers.length > 0 ? (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {data.offers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-white">{offer.providerName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    offer.offerType === 'flatrate'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : offer.offerType === 'free'
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {offer.offerType === 'flatrate' ? 'Subscription' : offer.offerType}
                  </span>
                </div>
                {offer.price && (
                  <span className="text-zinc-400 font-mono text-[11px]">{offer.price}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 px-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-zinc-400 space-y-1">
            <p>No verified streaming offers currently listed for this title in {region}.</p>
            <p className="text-[11px] text-zinc-500">Check physical media or alternative regional platforms.</p>
          </div>
        )}

        {/* Attribution */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
            <span>{data?.attribution || 'Streaming Availability (Powered by JustWatch)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
