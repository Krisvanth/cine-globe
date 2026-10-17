import { NextRequest, NextResponse } from 'next/server';
import { LeaderboardEntry } from '@/types/quiz';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const SEED_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'CriterionScholar',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    score: 2475,
    correctAnswers: 23,
    completedAt: '2026-10-16T18:40:00Z',
    durationSeconds: 168,
  },
  {
    rank: 2,
    username: 'Kurosawa_Archive',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    score: 2150,
    correctAnswers: 20,
    completedAt: '2026-10-16T21:15:00Z',
    durationSeconds: 195,
  },
  {
    rank: 3,
    username: 'NouvelleVague_Fan',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    score: 1825,
    correctAnswers: 17,
    completedAt: '2026-10-15T14:22:00Z',
    durationSeconds: 154,
  },
  {
    rank: 4,
    username: 'BongJoonHo_Disciple',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    score: 1500,
    correctAnswers: 14,
    completedAt: '2026-10-17T02:10:00Z',
    durationSeconds: 132,
  },
  {
    rank: 5,
    username: 'TarkovskyRhythm',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    score: 1325,
    correctAnswers: 12,
    completedAt: '2026-10-17T05:05:00Z',
    durationSeconds: 180,
  },
  {
    rank: 6,
    username: 'CinemaNovo_Poet',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    score: 1100,
    correctAnswers: 10,
    completedAt: '2026-10-16T11:45:00Z',
    durationSeconds: 110,
  },
];

const SEED_LEADERBOARD_DAILY: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'BongJoonHo_Disciple',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    score: 1500,
    correctAnswers: 14,
    completedAt: '2026-10-17T02:10:00Z',
    durationSeconds: 132,
  },
  {
    rank: 2,
    username: 'TarkovskyRhythm',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    score: 1325,
    correctAnswers: 12,
    completedAt: '2026-10-17T05:05:00Z',
    durationSeconds: 180,
  },
  {
    rank: 3,
    username: 'Apu_Voyager',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    score: 950,
    correctAnswers: 9,
    completedAt: '2026-10-17T07:30:00Z',
    durationSeconds: 105,
  },
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const period = searchParams.get('period') || 'all';

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        let query = supabase
          .from('leaderboard_public')
          .select('rank, username, avatar_url, score, correct_answers, completed_at, duration_seconds')
          .limit(20);

        if (period === 'daily') {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('completed_at', oneDayAgo);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: LeaderboardEntry[] = data.map((d: any) => ({
            rank: d.rank,
            username: d.username,
            avatarUrl: d.avatar_url,
            score: d.score,
            correctAnswers: d.correct_answers,
            completedAt: d.completed_at,
            durationSeconds: d.duration_seconds,
          }));

          return NextResponse.json({
            success: true,
            period,
            leaderboard: mapped,
            source: 'database',
          });
        }
      }
    } catch (err) {
      console.warn('[Leaderboard] DB query error, using seed:', err);
    }
  }

  // Fallback to verified seed leaderboard
  const entries = period === 'daily' ? SEED_LEADERBOARD_DAILY : SEED_LEADERBOARD_ALL_TIME;

  return NextResponse.json({
    success: true,
    period,
    leaderboard: entries,
    source: 'seed_catalogue',
  });
}
