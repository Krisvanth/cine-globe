import { describe, it, expect } from 'vitest';
import {
  filterMovies,
  selectWeightedMovie,
  discoverMovieForCountry,
} from '@/lib/movies/recommendationEngine';
import { Movie } from '@/types/movie';
import { MovieProvider } from '@/lib/movies/types';

const MOCK_TEST_MOVIES: Movie[] = [
  {
    id: 'test-1',
    externalId: 101,
    externalSource: 'TMDB',
    title: 'Tokyo Story',
    originalTitle: '東京物語',
    releaseYear: 1953,
    productionCountries: ['JP'],
    originalLanguage: 'ja',
    genres: ['Drama'],
    runtime: 136,
    synopsis: 'An old couple visit their children in Tokyo.',
    posterUrl: '',
    rating: 8.5,
    ratingSource: 'TMDB',
    voteCount: 1200,
  },
  {
    id: 'test-2',
    externalId: 102,
    externalSource: 'TMDB',
    title: 'Seven Samurai',
    originalTitle: '七人の侍',
    releaseYear: 1954,
    productionCountries: ['JP'],
    originalLanguage: 'ja',
    genres: ['Action', 'Drama'],
    runtime: 207,
    synopsis: 'Samurai defend a village.',
    posterUrl: '',
    rating: 8.6,
    ratingSource: 'TMDB',
    voteCount: 3500,
  },
  {
    id: 'test-3',
    externalId: 103,
    externalSource: 'TMDB',
    title: 'Portrait of a Lady on Fire',
    originalTitle: 'Portrait de la jeune fille en feu',
    releaseYear: 2019,
    productionCountries: ['FR'],
    originalLanguage: 'fr',
    genres: ['Drama', 'Romance'],
    runtime: 122,
    synopsis: 'A female painter paints a portrait.',
    posterUrl: '',
    rating: 8.2,
    ratingSource: 'TMDB',
    voteCount: 2600,
  },
  {
    id: 'test-4',
    externalId: 104,
    externalSource: 'TMDB',
    title: 'La Haine',
    originalTitle: 'La Haine',
    releaseYear: 1995,
    productionCountries: ['FR'],
    originalLanguage: 'fr',
    genres: ['Crime', 'Drama'],
    runtime: 98,
    synopsis: '24 hours in the lives of three young men.',
    posterUrl: '',
    rating: 8.1,
    ratingSource: 'TMDB',
    voteCount: 3200,
  },
];

const mockProvider: MovieProvider = {
  name: 'MockTMDB',
  isAvailable: () => true,
  getMoviesByCountry: async (code: string) =>
    MOCK_TEST_MOVIES.filter((m) => m.productionCountries.includes(code.toUpperCase())),
  getMovieDetails: async () => null,
};

describe('Movie Recommendation Engine (Live TMDB Mode)', () => {
  it('enforces strict production country matching', () => {
    const japanMatches = filterMovies(MOCK_TEST_MOVIES, 'JP');
    expect(japanMatches.length).toBeGreaterThan(0);
    for (const movie of japanMatches) {
      expect(movie.productionCountries).toContain('JP');
    }
  });

  it('filters by genre correctly', () => {
    const dramaMatches = filterMovies(MOCK_TEST_MOVIES, 'FR', { genre: 'Drama' });
    expect(dramaMatches.length).toBeGreaterThan(0);
    for (const movie of dramaMatches) {
      expect(movie.genres.map((g) => g.toLowerCase())).toContain('drama');
    }
  });

  it('filters by original language correctly', () => {
    const frenchMatches = filterMovies(MOCK_TEST_MOVIES, 'FR', { language: 'fr' });
    expect(frenchMatches.length).toBeGreaterThan(0);
    for (const movie of frenchMatches) {
      expect(movie.originalLanguage.toLowerCase()).toBe('fr');
    }
  });

  it('filters by minimum rating correctly', () => {
    const highRated = filterMovies(MOCK_TEST_MOVIES, 'JP', { minRating: 8.6 });
    for (const movie of highRated) {
      expect(movie.rating).toBeGreaterThanOrEqual(8.6);
    }
  });

  it('filters by maximum runtime correctly', () => {
    const shortFilms = filterMovies(MOCK_TEST_MOVIES, 'FR', { maxRuntime: 100 });
    expect(shortFilms.length).toBe(1);
    expect(shortFilms[0].title).toBe('La Haine');
  });

  it('excludes recently shown movies when alternatives exist', async () => {
    const firstDiscovery = await discoverMovieForCountry('JP', undefined, [], mockProvider);
    const excludedId = firstDiscovery.movie.id;

    const secondDiscovery = await discoverMovieForCountry('JP', undefined, [excludedId], mockProvider);
    if (secondDiscovery.alternativesCount > 0) {
      expect(secondDiscovery.movie.id).not.toBe(excludedId);
    }
  });

  it('weighted movie selection picks an eligible movie', () => {
    const samplePool: Movie[] = MOCK_TEST_MOVIES.slice(0, 3);
    const selected = selectWeightedMovie(samplePool);
    expect(samplePool.map((m) => m.id)).toContain(selected.id);
  });
});
