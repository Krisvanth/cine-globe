import { describe, it, expect, beforeEach } from 'vitest';
import {
  addToGuestWatchlist,
  getGuestWatchlist,
  removeFromGuestWatchlist,
  markAsGuestWatched,
  getGuestWatchedFilms,
  isMovieInGuestWatchlist,
  isMovieInGuestWatched,
} from '@/lib/guest/guestStorage';
import { Movie } from '@/types/movie';

const mockMovie: Movie = {
  id: 'test-film-1',
  externalId: 9991,
  externalSource: 'CURATED',
  title: 'Tokyo Twilight',
  releaseYear: 1957,
  productionCountries: ['JP'],
  originalLanguage: 'ja',
  genres: ['Drama'],
  runtime: 140,
  synopsis: 'A family portrait in postwar Japan.',
  posterUrl: 'https://image.tmdb.org/t/p/w500/test.jpg',
  rating: 7.8,
  ratingSource: 'TMDB',
  voteCount: 120,
};

describe('Guest Storage Persistence & Consistency', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds and prevents duplicate entries in watchlist', () => {
    addToGuestWatchlist(mockMovie);
    expect(getGuestWatchlist().length).toBe(1);
    expect(isMovieInGuestWatchlist(mockMovie.externalId)).toBe(true);

    // Duplicate add should not increase list size
    addToGuestWatchlist(mockMovie);
    expect(getGuestWatchlist().length).toBe(1);
  });

  it('removes film from watchlist', () => {
    addToGuestWatchlist(mockMovie);
    removeFromGuestWatchlist(mockMovie.externalId);
    expect(getGuestWatchlist().length).toBe(0);
    expect(isMovieInGuestWatchlist(mockMovie.externalId)).toBe(false);
  });

  it('marking as watched removes from watchlist for cross-collection consistency', () => {
    addToGuestWatchlist(mockMovie);
    expect(isMovieInGuestWatchlist(mockMovie.externalId)).toBe(true);

    // Mark watched with personal rating 9
    markAsGuestWatched(mockMovie, 9, '2026-10-17', true);

    // Watchlist should now be cleaned
    expect(isMovieInGuestWatchlist(mockMovie.externalId)).toBe(false);

    // Watched list should contain the record
    const watched = getGuestWatchedFilms();
    expect(watched.length).toBe(1);
    expect(watched[0].personalRating).toBe(9);
    expect(isMovieInGuestWatched(mockMovie.externalId)).toBe(true);
  });
});
