import { Movie, RecommendationFilters, DiscoverResponse } from '@/types/movie';
import { getCountryByCode } from '@/data/countries';
import { MovieProvider } from './types';
import { TMDBMovieProvider } from './tmdbAdapter';

const defaultProvider: MovieProvider = new TMDBMovieProvider();

/**
 * Filter movies strictly matching the given production country and user filter parameters
 */
export function filterMovies(
  movies: Movie[],
  countryCode: string,
  filters?: RecommendationFilters
): Movie[] {
  const targetCode = countryCode.toUpperCase();

  return movies.filter((movie) => {
    // 1. Strict production country check
    const matchesCountry = movie.productionCountries.some(
      (c) => c.toUpperCase() === targetCode
    );
    if (!matchesCountry) return false;

    // 2. Genre filter
    if (filters?.genre && filters.genre.toLowerCase() !== 'all') {
      const targetGenre = filters.genre.toLowerCase();
      const isTargetSciFi =
        targetGenre === 'sci-fi' ||
        targetGenre === 'scifi' ||
        targetGenre === 'sci fi' ||
        targetGenre === 'science fiction';

      const hasGenre = movie.genres.some((g) => {
        const gl = g.toLowerCase();
        if (gl === targetGenre) return true;
        if (
          isTargetSciFi &&
          (gl === 'sci-fi' || gl === 'scifi' || gl === 'sci fi' || gl === 'science fiction')
        ) {
          return true;
        }
        return false;
      });
      if (!hasGenre) return false;
    }

    // 3. Language filter
    if (filters?.language && filters.language.toLowerCase() !== 'all') {
      if (movie.originalLanguage.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }
    }

    // 4. Rating filter
    if (filters?.minRating && filters.minRating > 0) {
      if (movie.rating < filters.minRating) return false;
    }

    // 5. Runtime filter
    if (filters?.maxRuntime && filters.maxRuntime > 0 && movie.runtime > 0) {
      if (movie.runtime > filters.maxRuntime) return false;
    }

    // 6. Year range filter
    if (filters?.minYear && movie.releaseYear > 0) {
      if (movie.releaseYear < filters.minYear) return false;
    }
    if (filters?.maxYear && movie.releaseYear > 0) {
      if (movie.releaseYear > filters.maxYear) return false;
    }

    // 7. Hidden gems vs popular
    if (filters?.hiddenGemsOnly) {
      if (movie.rating < 7.0 || movie.voteCount > 2500) return false;
    } else if (filters?.popularOnly) {
      if (movie.voteCount < 100) return false;
    }

    return true;
  });
}

/**
 * Weighted random selection favoring higher rated films while ensuring variety
 */
export function selectWeightedMovie(eligibleMovies: Movie[]): Movie {
  if (eligibleMovies.length === 0) {
    throw new Error('Cannot select from empty movie list');
  }
  if (eligibleMovies.length === 1) {
    return eligibleMovies[0];
  }

  // Weight formula: (rating - 4.0)^2 + 1 to give top films higher weight while giving all a chance
  const weights = eligibleMovies.map((m) => {
    const r = Math.max(m.rating || 6.0, 5.0);
    return Math.pow(r - 4.0, 2);
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < eligibleMovies.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      return eligibleMovies[i];
    }
  }

  return eligibleMovies[eligibleMovies.length - 1];
}

/**
 * Primary discovery engine: queries live TMDB data exclusively (no hardcoded data),
 * applies filters, excludes recently shown IDs, and selects a weighted random recommendation.
 */
export async function discoverMovieForCountry(
  countryCode: string,
  filters?: RecommendationFilters,
  excludeIds: string[] = [],
  provider: MovieProvider = defaultProvider
): Promise<DiscoverResponse> {
  const country = getCountryByCode(countryCode);
  const countryInfo = country
    ? { code: country.code, name: country.name, flagEmoji: country.flagEmoji }
    : { code: countryCode.toUpperCase(), name: countryCode.toUpperCase(), flagEmoji: '🎬' };

  // 1. Fetch live movies from TMDB
  let liveMovies: Movie[] = [];
  if (provider.isAvailable()) {
    try {
      liveMovies = await provider.getMoviesByCountry(countryCode, filters);
    } catch (err) {
      console.error('[DiscoveryEngine] Live TMDB fetch error:', err);
    }
  }

  // 2. Strict country + user filters
  let eligible = filterMovies(liveMovies, countryCode, filters);
  let filterMatchSummary = '';

  // 3. If specific user filters yielded nothing, retry relaxing secondary filters (genre, minRating, runtime)
  // while PRESERVING the user's requested language filter
  if (eligible.length === 0 && provider.isAvailable()) {
    try {
      const relaxedFilters: RecommendationFilters =
        filters?.language && filters.language.toLowerCase() !== 'all'
          ? { language: filters.language }
          : {};
      const relaxedMovies = await provider.getMoviesByCountry(countryCode, relaxedFilters);
      eligible = filterMovies(relaxedMovies, countryCode, relaxedFilters);
      if (eligible.length > 0 && filters?.language) {
        filterMatchSummary = `No exact matches for your filter combination in ${countryInfo.name}. Showing top ${filters.language.toUpperCase()} films from ${countryInfo.name}.`;
      }
    } catch {
      // ignore relaxed query errors
    }
  }

  // 4. Strict country & language guarantee: never substitute an incorrect language film
  if (eligible.length === 0) {
    if (filters?.language && filters.language.toLowerCase() !== 'all') {
      throw new Error(`No ${filters.language.toUpperCase()} language films found for ${countryInfo.name} on TMDB.`);
    }
    throw new Error(`No movie results returned for ${countryInfo.name} (${countryCode.toUpperCase()}) from TMDB.`);
  }

  // 5. Exclude recently shown movies where sufficient alternatives exist
  const freshEligible = eligible.filter((m) => !excludeIds.includes(m.id));
  const pool = freshEligible.length > 0 ? freshEligible : eligible;

  // 6. Weighted random selection
  let selectedMovie = selectWeightedMovie(pool);

  // 7. Enrich selected movie with full credits and runtime (Director, Key Cast, Genres, Runtime, Tagline)
  if (provider.getMovieDetails && selectedMovie.externalId) {
    try {
      const details = await provider.getMovieDetails(selectedMovie.externalId);
      if (details) {
        selectedMovie = {
          ...selectedMovie,
          director: details.director || selectedMovie.director,
          cast: details.cast && details.cast.length > 0 ? details.cast : selectedMovie.cast,
          genres: details.genres && details.genres.length > 0 ? details.genres : selectedMovie.genres,
          runtime: details.runtime || selectedMovie.runtime,
          tagline: details.tagline || selectedMovie.tagline,
          backdropUrl: details.backdropUrl || selectedMovie.backdropUrl,
        };
      }
    } catch (err) {
      console.warn('[DiscoveryEngine] Failed to fetch movie details/credits:', err);
    }
  }

  return {
    movie: selectedMovie,
    country: countryInfo,
    filterMatchSummary,
    alternativesCount: pool.length - 1,
  };
}
