import { Movie } from './movie';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieExternalId: string | number;
  movieSource: 'TMDB' | 'CURATED';
  addedAt: string;
  movieSnapshot?: Movie; // Cached presentation data for quick UI rendering
}

export interface WatchedFilmItem {
  id: string;
  userId: string;
  movieExternalId: string | number;
  movieSource: 'TMDB' | 'CURATED';
  watchedAt: string;
  personalRating?: number; // 1 to 10
  reviewNotes?: string;
  createdAt: string;
  movieSnapshot?: Movie;
}
