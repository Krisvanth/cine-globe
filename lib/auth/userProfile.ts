'use client';

import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getMovieAvatarById } from '@/components/auth/MovieAvatars';

export interface UserProfile {
  name: string;
  avatarId: string;
  email?: string;
  isLoggedIn: boolean;
  isGuest?: boolean;
}

const PROFILE_KEY = 'cineglobe_user_profile_v1';

export function getLocalUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('cineglobe_profile_change'));
  } catch (err) {
    console.error('Failed to save local user profile:', err);
  }
}

export async function updateUserProfile(name: string, avatarId: string): Promise<UserProfile> {
  const avatar = getMovieAvatarById(avatarId);
  const supabase = getSupabaseBrowserClient();

  let email: string | undefined;

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        email = user.email;
        await supabase.auth.updateUser({
          data: {
            full_name: name,
            avatar_id: avatarId,
            character: avatar.name,
            film: avatar.film,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to update Supabase user metadata:', err);
    }
  }

  const newProfile: UserProfile = {
    name,
    avatarId,
    email,
    isLoggedIn: true,
    isGuest: false,
  };

  saveLocalUserProfile(newProfile);
  return newProfile;
}

export function clearUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_KEY);
    window.dispatchEvent(new Event('cineglobe_profile_change'));
  } catch (err) {
    console.error('Failed to clear user profile:', err);
  }
}
