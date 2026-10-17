'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WatchlistPage } from '@/components/library/WatchlistPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getLocalUserProfile } from '@/lib/auth/userProfile';

export default function WatchlistRoute() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-white">
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="flex-1 pt-20 sm:pt-24 pb-10 px-4 sm:px-6">
        <WatchlistPage />
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <Footer />
    </div>
  );
}

