'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Leaderboard feature temporarily disabled per user preference.
 * Redirects visitors back to the home discovery experience.
 */
export default function LeaderboardRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
