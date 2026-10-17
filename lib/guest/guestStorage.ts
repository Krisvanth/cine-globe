import { Movie } from '@/types/movie';
import { WatchlistItem, WatchedFilmItem } from '@/types/user';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

const WATCHLIST_KEY = 'cineglobe_guest_watchlist_v1';
const WATCHED_KEY = 'cineglobe_guest_watched_v1';
const QUIZ_GUEST_STATS_KEY = 'cineglobe_guest_quiz_stats_v1';

export interface GuestQuizStats {
  gamesPlayed: number;
  highestScore: number;
  longestStreak: number;
  totalCorrect: number;
  lastPlayedAt?: string;
}

export function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// -----------------------------------------------------------------------------
// LOCALSTORAGE READ HELPERS
// -----------------------------------------------------------------------------

export function getGuestWatchlist(): WatchlistItem[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getGuestWatchedFilms(): WatchedFilmItem[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(WATCHED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// WATCHLIST MUTATIONS (Local Cache + Async Supabase DB Sync)
// -----------------------------------------------------------------------------

export function addToGuestWatchlist(movie: Movie): WatchlistItem[] {
  if (!isLocalStorageAvailable()) return [];
  const list = getGuestWatchlist();
  const cleanId = String(movie.externalId || movie.id);
  const exists = list.some((item) => String(item.movieExternalId) === cleanId);
  if (exists) return list;

  const newItem: WatchlistItem = {
    id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: 'guest',
    movieExternalId: cleanId,
    movieSource: (movie.externalSource as any) || 'TMDB',
    addedAt: new Date().toISOString(),
    movieSnapshot: movie,
  };

  const updated = [newItem, ...list];
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('cineglobe_storage_change'));
  } catch (err) {
    console.error('Failed to save guest watchlist:', err);
  }

  // Asynchronously sync to Supabase database
  syncAddToSupabaseWatchlist(newItem, movie);

  return updated;
}

export function removeFromGuestWatchlist(movieExternalId: string | number): WatchlistItem[] {
  if (!isLocalStorageAvailable()) return [];
  const list = getGuestWatchlist();
  const cleanId = String(movieExternalId);
  const updated = list.filter((item) => String(item.movieExternalId) !== cleanId);
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('cineglobe_storage_change'));
  } catch (err) {
    console.error('Failed to remove from guest watchlist:', err);
  }

  // Asynchronously delete from Supabase database
  syncRemoveFromSupabaseWatchlist(cleanId);

  return updated;
}

export function isMovieInGuestWatchlist(movieExternalId: string | number): boolean {
  const list = getGuestWatchlist();
  return list.some((item) => String(item.movieExternalId) === String(movieExternalId));
}

// -----------------------------------------------------------------------------
// WATCHED FILMS MUTATIONS (Local Cache + Async Supabase DB Sync)
// -----------------------------------------------------------------------------

export function markAsGuestWatched(
  movie: Movie,
  personalRating?: number,
  watchedAt?: string,
  removeFromWatchlist: boolean = true
): WatchedFilmItem[] {
  if (!isLocalStorageAvailable()) return [];
  const list = getGuestWatchedFilms();
  const cleanId = String(movie.externalId || movie.id);

  // If already watched, update rating/date
  const filtered = list.filter((item) => String(item.movieExternalId) !== cleanId);

  const formattedDate = watchedAt || new Date().toISOString().split('T')[0];
  const newItem: WatchedFilmItem = {
    id: `watched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: 'guest',
    movieExternalId: cleanId,
    movieSource: (movie.externalSource as any) || 'TMDB',
    watchedAt: formattedDate,
    personalRating:
      personalRating && personalRating >= 1 && personalRating <= 10 ? personalRating : undefined,
    createdAt: new Date().toISOString(),
    movieSnapshot: movie,
  };

  const updated = [newItem, ...filtered];
  try {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(updated));
    if (removeFromWatchlist) {
      removeFromGuestWatchlist(cleanId);
    }
    window.dispatchEvent(new Event('cineglobe_storage_change'));
  } catch (err) {
    console.error('Failed to save guest watched film:', err);
  }

  // Asynchronously sync to Supabase database
  syncMarkWatchedToSupabase(newItem, movie, removeFromWatchlist);

  return updated;
}

export function removeFromGuestWatched(movieExternalId: string | number): WatchedFilmItem[] {
  if (!isLocalStorageAvailable()) return [];
  const list = getGuestWatchedFilms();
  const cleanId = String(movieExternalId);
  const updated = list.filter((item) => String(item.movieExternalId) !== cleanId);
  try {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('cineglobe_storage_change'));
  } catch (err) {
    console.error('Failed to remove from guest watched:', err);
  }

  // Asynchronously delete from Supabase database
  syncRemoveFromSupabaseWatched(cleanId);

  return updated;
}

export function isMovieInGuestWatched(movieExternalId: string | number): boolean {
  const list = getGuestWatchedFilms();
  return list.some((item) => String(item.movieExternalId) === String(movieExternalId));
}

// -----------------------------------------------------------------------------
// GUEST QUIZ STATS
// -----------------------------------------------------------------------------

export function getGuestQuizStats(): GuestQuizStats {
  if (!isLocalStorageAvailable()) {
    return { gamesPlayed: 0, highestScore: 0, longestStreak: 0, totalCorrect: 0 };
  }
  try {
    const raw = localStorage.getItem(QUIZ_GUEST_STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { gamesPlayed: 0, highestScore: 0, longestStreak: 0, totalCorrect: 0 };
  } catch {
    return { gamesPlayed: 0, highestScore: 0, longestStreak: 0, totalCorrect: 0 };
  }
}

export function recordGuestQuizGame(score: number, correctAnswers: number, streak: number): GuestQuizStats {
  const current = getGuestQuizStats();
  const updated: GuestQuizStats = {
    gamesPlayed: current.gamesPlayed + 1,
    highestScore: Math.max(current.highestScore, score),
    longestStreak: Math.max(current.longestStreak, streak),
    totalCorrect: current.totalCorrect + correctAnswers,
    lastPlayedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(QUIZ_GUEST_STATS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save guest quiz stats:', err);
  }
  return updated;
}

// -----------------------------------------------------------------------------
// SUPABASE CLOUD DATABASE SYNC ENGINE
// -----------------------------------------------------------------------------

async function syncAddToSupabaseWatchlist(item: WatchlistItem, movie: Movie) {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    item.userId = user.id;
    const { error } = await supabase.from('watchlist').upsert(
      {
        user_id: user.id,
        movie_external_id: String(movie.externalId || movie.id),
        movie_source: movie.externalSource || 'TMDB',
        movie_snapshot: movie,
        added_at: item.addedAt || new Date().toISOString(),
      },
      { onConflict: 'user_id,movie_external_id,movie_source' }
    );

    if (error) {
      console.error('[LibrarySync] Failed to save to Supabase watchlist:', error.message);
    } else {
      console.log(`[LibrarySync] Saved "${movie.title}" to Supabase watchlist in DB`);
    }
  } catch (err) {
    console.warn('[LibrarySync] Cloud sync notice:', err);
  }
}

async function syncRemoveFromSupabaseWatchlist(movieExternalId: string) {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('watchlist')
      .delete()
      .match({ user_id: user.id, movie_external_id: String(movieExternalId) });
    console.log(`[LibrarySync] Removed movie ${movieExternalId} from Supabase watchlist in DB`);
  } catch (err) {
    console.warn('[LibrarySync] Cloud delete notice:', err);
  }
}

async function syncMarkWatchedToSupabase(
  item: WatchedFilmItem,
  movie: Movie,
  removeFromWatchlist: boolean
) {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    item.userId = user.id;
    const { error } = await supabase.from('watched_films').upsert(
      {
        user_id: user.id,
        movie_external_id: String(movie.externalId || movie.id),
        movie_source: movie.externalSource || 'TMDB',
        watched_at: item.watchedAt,
        personal_rating: item.personalRating,
        movie_snapshot: movie,
      },
      { onConflict: 'user_id,movie_external_id,movie_source' }
    );

    if (error) {
      console.error('[LibrarySync] Failed to save to Supabase watched_films:', error.message);
    } else {
      console.log(`[LibrarySync] Saved "${movie.title}" to Supabase watched_films in DB`);
    }

    if (removeFromWatchlist) {
      await syncRemoveFromSupabaseWatchlist(String(movie.externalId || movie.id));
    }
  } catch (err) {
    console.warn('[LibrarySync] Cloud sync notice:', err);
  }
}

async function syncRemoveFromSupabaseWatched(movieExternalId: string) {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('watched_films')
      .delete()
      .match({ user_id: user.id, movie_external_id: String(movieExternalId) });
    console.log(`[LibrarySync] Removed movie ${movieExternalId} from Supabase watched_films in DB`);
  } catch (err) {
    console.warn('[LibrarySync] Cloud delete notice:', err);
  }
}

/**
 * Bidirectional Cloud Sync:
 * Fetches all Watchlist and Watched items from Supabase database for the logged-in user,
 * migrates any local guest records into Supabase, and updates local cache.
 */
export async function syncCloudLibraryWithLocal(): Promise<void> {
  if (!isLocalStorageAvailable() || !isSupabaseConfigured()) return;

  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Cloud Watchlist from Supabase
    const { data: cloudWatchlist, error: wlError } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    // 2. Fetch Cloud Watched Films from Supabase
    const { data: cloudWatched, error: wtError } = await supabase
      .from('watched_films')
      .select('*')
      .eq('user_id', user.id)
      .order('watched_at', { ascending: false });

    if (wlError) {
      console.warn('[LibrarySync] Could not read cloud watchlist:', wlError.message);
    }
    if (wtError) {
      console.warn('[LibrarySync] Could not read cloud watched films:', wtError.message);
    }

    // 3. Migrate any local guest items into Supabase
    const localWatchlist = getGuestWatchlist();
    const guestItemsToSync = localWatchlist.filter(
      (item) => item.userId === 'guest' && item.movieSnapshot
    );

    for (const item of guestItemsToSync) {
      const alreadyInCloud = (cloudWatchlist || []).some(
        (cw: any) => String(cw.movie_external_id) === String(item.movieExternalId)
      );
      if (!alreadyInCloud && item.movieSnapshot) {
        await supabase.from('watchlist').upsert(
          {
            user_id: user.id,
            movie_external_id: String(item.movieExternalId),
            movie_source: item.movieSource || 'TMDB',
            movie_snapshot: item.movieSnapshot,
            added_at: item.addedAt || new Date().toISOString(),
          },
          { onConflict: 'user_id,movie_external_id,movie_source' }
        );
      }
    }

    // 4. Transform cloud rows to local interface
    const mappedWatchlist: WatchlistItem[] = (cloudWatchlist || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      movieExternalId: row.movie_external_id,
      movieSource: row.movie_source || 'TMDB',
      addedAt: row.added_at,
      movieSnapshot: row.movie_snapshot,
    }));

    const mappedWatched: WatchedFilmItem[] = (cloudWatched || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      movieExternalId: row.movie_external_id,
      movieSource: row.movie_source || 'TMDB',
      watchedAt: row.watched_at,
      personalRating: row.personal_rating ? Number(row.personal_rating) : undefined,
      reviewNotes: row.review_notes,
      createdAt: row.created_at,
      movieSnapshot: row.movie_snapshot,
    }));

    // Save to local cache so all client components immediately display cloud library
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(mappedWatchlist));
    localStorage.setItem(WATCHED_KEY, JSON.stringify(mappedWatched));

    // Dispatch global event for instant UI update
    window.dispatchEvent(new Event('cineglobe_storage_change'));
    console.log(
      `[LibrarySync] Synchronized with Supabase DB: ${mappedWatchlist.length} watchlist, ${mappedWatched.length} watched`
    );
  } catch (err) {
    console.warn('[LibrarySync] Sync process notice:', err);
  }
}
