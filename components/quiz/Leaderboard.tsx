'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Sparkles, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '@/types/quiz';

export const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<'all' | 'daily'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setEntries(json.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-400 to-zinc-200 text-black font-extrabold flex items-center justify-center text-xs shadow-md">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-xs flex items-center justify-center">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#e5c07b]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Cinephiles</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
          Cine Quiz Leaderboard
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Rankings are calculated server-side based on highest score, correct answers, and speed.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setPeriod('all')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              period === 'all'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All-Time Champions
          </button>
          <button
            onClick={() => setPeriod('daily')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              period === 'daily'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Masters
          </button>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-3xl glass-panel-gold border border-[#d4af37]/20 p-2 sm:p-4 shadow-xl">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#d4af37]" />
            <span>Loading leaderboard scores...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No quiz records logged for this period yet. Be the first to play!
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all border ${
                  entry.rank === 1
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {getRankBadge(entry.rank)}

                  {/* Avatar / Username */}
                  <div className="flex items-center gap-2.5">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.username}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-xs">
                        {entry.username.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        {entry.username}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#d4af37]" />
                        <span>{entry.correctAnswers} correct answers</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  {entry.durationSeconds && (
                    <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{entry.durationSeconds}s</span>
                    </span>
                  )}
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-extrabold text-[#e5c07b] font-mono block leading-none">
                      {entry.score}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">
                      pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
