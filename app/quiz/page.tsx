'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Quiz feature temporarily disabled per user preference.
 * Redirects visitors back to the home discovery experience.
 */
export default function QuizPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
