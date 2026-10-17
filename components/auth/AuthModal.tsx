'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  Sparkles,
  LogOut,
  User,
  Edit3,
  Check,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  MOVIE_AVATARS,
  MovieCharacterAvatar,
  getMovieAvatarById,
} from '@/components/auth/MovieAvatars';
import {
  getLocalUserProfile,
  clearUserProfile,
  updateUserProfile,
  UserProfile,
} from '@/lib/auth/userProfile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [configured, setConfigured] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-modal avatar customizer state
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('char-spiderman');

  useEffect(() => {
    const isConf = isSupabaseConfigured();
    setConfigured(isConf);
    const profile = getLocalUserProfile();
    setLocalProfile(profile);

    if (profile) {
      setEditName(profile.name || '');
      setSelectedAvatarId(profile.avatarId || 'char-spiderman');
    }

    if (isConf) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.getSession().then(({ data }) => {
          if (data?.session?.user) {
            setCurrentUser(data.session.user);
            if (data.session.user.user_metadata?.full_name) {
              setEditName(data.session.user.user_metadata.full_name);
            }
            if (data.session.user.user_metadata?.avatar_id) {
              setSelectedAvatarId(data.session.user.user_metadata.avatar_id);
            }
          }
        });

        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            setCurrentUser(data.user);
            if (data.user.user_metadata?.full_name) {
              setEditName(data.user.user_metadata.full_name);
            }
            if (data.user.user_metadata?.avatar_id) {
              setSelectedAvatarId(data.user.user_metadata.avatar_id);
            }
          }
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setCurrentUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (!configured) {
      setErrorMsg('Supabase credentials are not configured in .env.local yet.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase client unavailable');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      clearUserProfile();
      setCurrentUser(null);
      setLocalProfile(null);
      onClose();
      router.push('/login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatarCustomization = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const finalName = editName.trim() || 'Cinephile';
      const updated = await updateUserProfile(finalName, selectedAvatarId);
      setLocalProfile(updated);
      setIsCustomizing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update avatar.');
    } finally {
      setLoading(false);
    }
  };

  const avatarId =
    currentUser?.user_metadata?.avatar_id || localProfile?.avatarId || null;
  const displayName =
    currentUser?.user_metadata?.full_name || localProfile?.name || currentUser?.email?.split('@')[0] || 'Cinephile';

  const isLoggedIn = Boolean(currentUser || localProfile?.isLoggedIn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-gold p-6 bg-[#0c0d12]/98 border border-[#d4af37]/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoggedIn ? (
          /* Profile View or Customize View when Signed In */
          isCustomizing ? (
            /* IN-MODAL AVATAR CUSTOMIZER */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizing(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Customize Your Avatar
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Pick any movie character & edit your profile name
                  </p>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your display name..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Characters Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Movie Characters ({MOVIE_AVATARS.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {MOVIE_AVATARS.map((char: MovieCharacterAvatar) => {
                    const isSelected = selectedAvatarId === char.id;
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(char.id)}
                        className={`relative p-2 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all border ${
                          isSelected
                            ? 'border-[#d4af37] bg-[#d4af37]/20 shadow-md ring-1 ring-[#d4af37]'
                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[9px] font-bold">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <div>{char.render(42)}</div>
                        <span className="text-[11px] font-bold text-white truncate max-w-[70px]">
                          {char.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAvatarCustomization}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Avatar Changes</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD PROFILE OVERVIEW */
            <div className="space-y-5">
              {/* Header / Avatar */}
              <div className="text-center space-y-3 pt-2">
                <div className="relative inline-block">
                  {avatarId ? (
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] shadow-xl shadow-[#d4af37]/20 flex items-center justify-center">
                      {getMovieAvatarById(avatarId).render(80)}
                    </div>
                  ) : currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture ? (
                    <img
                      src={currentUser.user_metadata.avatar_url || currentUser.user_metadata.picture}
                      alt="Profile Avatar"
                      className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-500/20"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-xl font-bold">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c0d12]" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {displayName}
                  </h3>
                  {avatarId && (
                    <p className="text-xs text-[#e5c07b] font-medium">
                      Avatar: {getMovieAvatarById(avatarId).name} ({getMovieAvatarById(avatarId).film})
                    </p>
                  )}
                  {currentUser?.email && (
                    <p className="text-[11px] text-zinc-400">{currentUser.email}</p>
                  )}
                </div>

                {/* Instant Customize Avatar Trigger */}
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomizing(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-[#d4af37]/40 text-[#e5c07b] hover:bg-[#d4af37]/15 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Customize Avatar</span>
                  </button>
                </div>
              </div>

              {/* Cloud Library Sync Card */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Cloud Library Synced</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your personal Watchlist, Watched films, and movie ratings are securely saved with Supabase.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-red-200 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{loading ? 'Signing out...' : 'Sign Out of CineGlobe'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )
        ) : (
          /* Sign-In View when Logged Out (Google Only) */
          <div>
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                CineGlobe Account
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Sign in with Google to sync your watchlist, rate films, and personalize your bitmoji character avatar.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-bold bg-white hover:bg-zinc-100 text-black shadow-lg shadow-white/10 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              <Link
                href="/login"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Go to Login Page</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
