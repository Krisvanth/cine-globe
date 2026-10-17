'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  ArrowRight,
  Check,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  MOVIE_AVATARS,
  MovieCharacterAvatar,
  getMovieAvatarById,
} from '@/components/auth/MovieAvatars';
import {
  updateUserProfile,
  getLocalUserProfile,
} from '@/lib/auth/userProfile';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'signin' | 'onboarding' | 'customize'
  const isCustomizeQuery = searchParams.get('customize') === '1' || searchParams.get('mode') === 'customize';
  const [mode, setMode] = useState<'signin' | 'onboarding' | 'customize'>(
    isCustomizeQuery ? 'customize' : 'signin'
  );

  const [name, setName] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('char-spiderman');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const authError = searchParams.get('auth_error');
    if (authError) {
      setErrorMsg(decodeURIComponent(authError));
    }

    const checkExistingSession = async () => {
      const supabase = getSupabaseBrowserClient();
      let currentUser: any = null;

      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          currentUser = user;
        } catch (e) {
          console.warn('Session check warning:', e);
        }
      }

      const local = getLocalUserProfile();

      // If user came specifically to customize their avatar
      if (isCustomizeQuery) {
        const currentName =
          currentUser?.user_metadata?.full_name ||
          local?.name ||
          currentUser?.email?.split('@')[0] ||
          '';
        const currentAvatar =
          currentUser?.user_metadata?.avatar_id ||
          local?.avatarId ||
          'char-spiderman';

        setName(currentName);
        setSelectedAvatarId(currentAvatar);
        setMode('customize');
        return;
      }

      // If user is already logged in with an avatar set, redirect home
      if (currentUser) {
        if (currentUser.user_metadata?.avatar_id) {
          router.push('/');
          return;
        }
        // User logged in via Google but hasn't set an avatar yet -> go to onboarding!
        setName(currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '');
        setMode('onboarding');
        return;
      }

      // Check local storage profile
      if (local?.isLoggedIn && local.avatarId) {
        router.push('/');
      }
    };

    checkExistingSession();
  }, [router, searchParams, isCustomizeQuery]);

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  // Handle Profile / Avatar Save (Onboarding or Customizing)
  const handleSaveProfile = async () => {
    const finalName = name.trim() || 'Cinephile';
    try {
      setLoading(true);
      setErrorMsg(null);

      // Save user profile locally & sync Supabase user metadata
      await updateUserProfile(finalName, selectedAvatarId);

      setSuccessMsg(
        mode === 'customize'
          ? 'Avatar & profile updated successfully!'
          : 'Welcome to CineGlobe! Profile created.'
      );

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle cosmic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#d4af37]/15 via-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 text-center mb-8 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4af37]/30 via-[#d4af37] to-amber-200 flex items-center justify-center text-black font-bold shadow-lg shadow-[#d4af37]/30 group-hover:scale-105 transition-transform duration-300">
            <Film className="w-5 h-5 text-black stroke-[2.2]" />
          </div>
          <span className="font-extrabold tracking-wider text-xl text-white group-hover:text-[#e5c07b] transition-colors">
            CINE<span className="text-[#d4af37]">GLOBE</span>
          </span>
        </Link>
        <p className="text-xs text-zinc-400 font-medium">
          One spin. One country. One movie.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl glass-panel-gold bg-[#0c0d14]/95 border border-[#d4af37]/30 p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 1: SIGN IN (GOOGLE ONLY)                                       */}
        {/* ------------------------------------------------------------------- */}
        {mode === 'signin' ? (
          <div className="space-y-6 text-center py-2 animate-in fade-in">
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-[#d4af37]/20 to-amber-500/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#d4af37]/10">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Sign In to CineGlobe
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Connect securely with your Google account to track your watched films, rate movies, and choose your bitmoji character avatar.
              </p>
            </div>

            {/* Prominent Google OAuth Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold bg-white hover:bg-zinc-100 text-black shadow-xl shadow-white/5 transition-all cursor-pointer active:scale-95 border border-white/20 hover:border-white"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.21v3.13C3.26 21.36 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.21C.44 8.14 0 9.87 0 12s.44 3.86 1.21 5.4l4.11-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.21 6.6l4.11 3.13c.94-2.83 3.58-4.98 6.68-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-500">
              By continuing, you agree to discover the best world cinema.
            </p>
          </div>
        ) : (
          /* ----------------------------------------------------------------- */
          /* VIEW 2: ONBOARDING / CUSTOMIZE AVATAR (SINGLE CATEGORY OF 10)     */
          /* ----------------------------------------------------------------- */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#d4af37]/15 text-[#e5c07b] border border-[#d4af37]/30 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {mode === 'customize' ? 'Personalize Avatar' : 'New User Setup'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Choose Your Movie Character
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Pick your bitmoji avatar and set the display name for your CineGlobe profile.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (e.g. Alex, Wayne, Sarah)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            {/* Single Unified Category: Movie Characters */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                  Movie Character Avatars ({MOVIE_AVATARS.length})
                </span>
                <span className="text-[11px] text-[#e5c07b] font-medium">
                  Tap to select
                </span>
              </div>

              {/* Responsive Character Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-[330px] overflow-y-auto pr-1">
                {MOVIE_AVATARS.map((char: MovieCharacterAvatar) => {
                  const isSelected = selectedAvatarId === char.id;

                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => setSelectedAvatarId(char.id)}
                      className={`relative p-2.5 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/15 shadow-lg shadow-[#d4af37]/25 scale-105 ring-1 ring-[#d4af37]'
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Checkmark badge when active */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] shadow-sm font-bold">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Render Bitmoji SVG */}
                      <div className="transition-transform group-hover:scale-105">
                        {char.render(52)}
                      </div>

                      <div className="space-y-0.5 w-full">
                        <div className="text-xs font-bold text-white truncate">
                          {char.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {char.film}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Summary Preview */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <div className="shrink-0">
                {getMovieAvatarById(selectedAvatarId).render(44)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {name.trim() || 'Your Name'} as{' '}
                  <span className="text-[#e5c07b]">
                    {getMovieAvatarById(selectedAvatarId).name}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  from {getMovieAvatarById(selectedAvatarId).film}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>
                    {mode === 'customize'
                      ? 'Save Profile Changes'
                      : 'Save Profile & Enter CineGlobe'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
          <span className="text-xs text-zinc-400">Loading CineGlobe...</span>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
