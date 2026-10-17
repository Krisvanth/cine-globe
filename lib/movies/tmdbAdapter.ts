import { Movie, RecommendationFilters, RatingSource } from '@/types/movie';
import { MovieProvider } from './types';
import https from 'https';
import dns from 'dns';

// Dedicated DNS resolver using public DNS to bypass ISP DNS poisoning
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

// Cached IP addresses for api.themoviedb.org to avoid resolving on every single call
let cachedIps: string[] = ['3.175.86.37', '3.175.86.67', '3.175.86.50', '3.175.86.103'];
let lastDnsResolve = 0;

function refreshDnsCache() {
  if (Date.now() - lastDnsResolve < 300_000) return; // refresh every 5 mins
  dnsResolver.resolve4('api.themoviedb.org', (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      cachedIps = addresses;
      lastDnsResolve = Date.now();
    }
  });
}
refreshDnsCache();

function customLookup(
  hostname: string,
  options: any,
  callback: (err: Error | null, address?: any, family?: number) => void
) {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'object' && options !== null ? options : {};

  if (hostname === 'api.themoviedb.org' && cachedIps.length > 0) {
    if (opts.all) {
      return cb(null, cachedIps.map(ip => ({ address: ip, family: 4 })));
    }
    const chosen = cachedIps[Math.floor(Math.random() * cachedIps.length)];
    return cb(null, chosen, 4);
  }

  // Fallback to resolver for other hosts if any
  dnsResolver.resolve4(hostname, (err, addresses) => {
    if (err) return cb(err);
    if (!addresses || addresses.length === 0) return cb(new Error(`No IP found for ${hostname}`));
    if (opts.all) {
      cb(null, addresses.map(a => ({ address: a, family: 4 })));
    } else {
      cb(null, addresses[0], 4);
    }
  });
}

/** Helper returning auth headers / query param for TMDB */
export function getTMDBAuth(): { headers: Record<string, string>; apiKeyParam?: string } | null {
  const bearer = process.env.TMDB_READ_ACCESS_TOKEN;
  if (bearer && bearer.trim().length > 10 && !bearer.includes('your-tmdb')) {
    return { headers: { Authorization: `Bearer ${bearer.trim()}` } };
  }
  const key = process.env.TMDB_API_KEY;
  if (key && key.trim().length > 0 && !key.includes('your-tmdb')) {
    return { headers: {}, apiKeyParam: key.trim() };
  }
  return null;
}

/** Robust HTTPS GET function that bypasses ISP DNS hijacking & cert validation issues */
export function tmdbGet(urlStr: string, headers: Record<string, string>): Promise<any> {
  refreshDnsCache();
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        rejectUnauthorized: false,
        lookup: customLookup,
        timeout: 8000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CineGlobe/1.0',
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e: any) {
              reject(new Error(`[TMDB] JSON parse error: ${e.message}`));
            }
          } else {
            reject(new Error(`[TMDB] HTTP status ${res.statusCode}: ${body.slice(0, 100)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('ETIMEDOUT'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// TMDB standard genre mappings
const TMDB_GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'Sci-Fi': 878,
  'Sci-fi': 878,
  'SciFi': 878,
  'Sci Fi': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export class TMDBMovieProvider implements MovieProvider {
  name = 'TMDB';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
  }

  /** Returns Bearer token (v4) if set, otherwise v3 API key, or null if neither configured. */
  private getCredential(): { type: 'bearer'; token: string } | { type: 'apikey'; key: string } | null {
    const bearer = process.env.TMDB_READ_ACCESS_TOKEN;
    if (bearer && bearer.trim().length > 10 && !bearer.includes('your-tmdb')) {
      return { type: 'bearer', token: bearer.trim() };
    }
    const key = process.env.TMDB_API_KEY;
    if (key && key.trim().length > 0 && !key.includes('your-tmdb')) {
      return { type: 'apikey', key: key.trim() };
    }
    return null;
  }

  /** Auth headers for the chosen credential. */
  private buildHeaders(cred: NonNullable<ReturnType<typeof this.getCredential>>): Record<string, string> {
    if (cred.type === 'bearer') {
      return { Authorization: `Bearer ${cred.token}` };
    }
    return {};
  }

  /** Attach v3 api_key query param only when not using Bearer auth. */
  private applyApiKey(url: URL, cred: NonNullable<ReturnType<typeof this.getCredential>>): void {
    if (cred.type === 'apikey') {
      url.searchParams.set('api_key', cred.key);
    }
  }

  isAvailable(): boolean {
    return this.getCredential() !== null;
  }

  async getMoviesByCountry(
    countryCode: string,
    filters?: RecommendationFilters
  ): Promise<Movie[]> {
    const cred = this.getCredential();
    if (!cred || !this.isAvailable()) {
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/discover/movie`);
      this.applyApiKey(url, cred);
      url.searchParams.set('with_origin_country', countryCode.toUpperCase());
      url.searchParams.set('include_adult', 'false');

      // Sensible vote count thresholds so real world cinema isn't filtered to 0
      if (filters?.popularOnly) {
        url.searchParams.set('vote_count.gte', '50');
        url.searchParams.set('sort_by', 'popularity.desc');
      } else if (filters?.hiddenGemsOnly) {
        url.searchParams.set('vote_count.gte', '10');
        url.searchParams.set('vote_count.lte', '1500');
        url.searchParams.set('sort_by', 'vote_average.desc');
      } else {
        url.searchParams.set('vote_count.gte', '10');
        url.searchParams.set('sort_by', 'vote_average.desc');
      }

      if (filters?.genre && filters.genre !== 'All' && filters.genre !== 'all') {
        const found = Object.entries(TMDB_GENRES).find(
          ([name]) => name.toLowerCase() === filters.genre!.toLowerCase()
        );
        if (found) {
          url.searchParams.set('with_genres', String(found[1]));
        }
      }

      if (filters?.language && filters.language.toLowerCase() !== 'all') {
        url.searchParams.set('with_original_language', filters.language.toLowerCase());
      }

      if (filters?.minRating && filters.minRating > 0) {
        url.searchParams.set('vote_average.gte', String(filters.minRating));
      }

      if (filters?.maxRuntime && filters.maxRuntime > 0) {
        url.searchParams.set('with_runtime.lte', String(filters.maxRuntime));
      }

      if (filters?.minYear) {
        url.searchParams.set('primary_release_date.gte', `${filters.minYear}-01-01`);
      }

      if (filters?.maxYear) {
        url.searchParams.set('primary_release_date.lte', `${filters.maxYear}-12-31`);
      }

      const data = await tmdbGet(url.toString(), this.buildHeaders(cred));

      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      const movies: Movie[] = data.results.map((raw: any) => {
        const releaseYear = raw.release_date
          ? parseInt(raw.release_date.substring(0, 4), 10)
          : 0;

        const movieGenres: string[] = Array.isArray(raw.genre_ids)
          ? raw.genre_ids.map((id: number) => TMDB_GENRE_NAMES[id]).filter(Boolean)
          : [];

        return {
          id: `tmdb-${raw.id}`,
          externalId: raw.id,
          externalSource: 'TMDB' as const,
          title: raw.title || raw.original_title || 'Untitled',
          originalTitle: raw.original_title,
          releaseYear: isNaN(releaseYear) ? 0 : releaseYear,
          productionCountries: [countryCode.toUpperCase()],
          originalLanguage: raw.original_language || '',
          genres: movieGenres,
          runtime: 0,
          synopsis: raw.overview || '',
          posterUrl: raw.poster_path
            ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
            : '',
          backdropUrl: raw.backdrop_path
            ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}`
            : undefined,
          rating: Number((raw.vote_average || 0).toFixed(1)),
          ratingSource: 'TMDB' as RatingSource,
          voteCount: raw.vote_count || 0,
        };
      });

      return movies;
    } catch (err: any) {
      console.error('[TMDB] Discover error:', err.message ?? err);
      return [];
    }
  }

  async getMovieDetails(id: string | number): Promise<Movie | null> {
    const cred = this.getCredential();
    if (!cred || !this.isAvailable()) return null;

    try {
      const numericId = typeof id === 'string' ? id.replace('tmdb-', '') : id;
      const urlObj = new URL(`${this.baseUrl}/movie/${numericId}`);
      this.applyApiKey(urlObj, cred);
      urlObj.searchParams.set('append_to_response', 'credits,watch/providers');

      const data = await tmdbGet(urlObj.toString(), this.buildHeaders(cred));

      const countries = Array.isArray(data.production_countries)
        ? data.production_countries.map((c: any) => c.iso_3166_1)
        : [];

      const director = data.credits?.crew?.find(
        (c: any) => c.job === 'Director' || c.department === 'Directing'
      )?.name;

      const cast = data.credits?.cast
        ?.slice(0, 5)
        .map((c: any) => c.name);

      return {
        id: `tmdb-${data.id}`,
        externalId: data.id,
        externalSource: 'TMDB',
        title: data.title,
        originalTitle: data.original_title,
        releaseYear: data.release_date ? parseInt(data.release_date.slice(0, 4), 10) : 0,
        productionCountries: countries,
        originalLanguage: data.original_language,
        genres: (data.genres || []).map((g: any) => g.name),
        runtime: data.runtime || 0,
        synopsis: data.overview || '',
        posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
        backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '',
        director,
        cast,
        rating: Number((data.vote_average || 0).toFixed(1)),
        ratingSource: 'TMDB',
        voteCount: data.vote_count || 0,
        tagline: data.tagline,
      };
    } catch (err: any) {
      console.error('[TMDB] getMovieDetails error:', err.message ?? err);
      return null;
    }
  }

  async searchMovies(query: string): Promise<Movie[]> {
    const cred = this.getCredential();
    if (!cred || !this.isAvailable() || !query.trim()) {
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/search/movie`);
      this.applyApiKey(url, cred);
      url.searchParams.set('query', query.trim());
      url.searchParams.set('include_adult', 'false');
      url.searchParams.set('page', '1');

      const data = await tmdbGet(url.toString(), this.buildHeaders(cred));
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.slice(0, 10).map((raw: any) => {
        const releaseYear = raw.release_date
          ? parseInt(raw.release_date.substring(0, 4), 10)
          : 0;

        const movieGenres: string[] = Array.isArray(raw.genre_ids)
          ? raw.genre_ids.map((id: number) => TMDB_GENRE_NAMES[id]).filter(Boolean)
          : [];

        return {
          id: `tmdb-${raw.id}`,
          externalId: raw.id,
          externalSource: 'TMDB' as const,
          title: raw.title || raw.original_title || 'Untitled',
          originalTitle: raw.original_title,
          releaseYear: isNaN(releaseYear) ? 0 : releaseYear,
          productionCountries: raw.origin_country || [],
          originalLanguage: raw.original_language || '',
          genres: movieGenres,
          runtime: 0,
          synopsis: raw.overview || '',
          posterUrl: raw.poster_path
            ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
            : '',
          backdropUrl: raw.backdrop_path
            ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}`
            : undefined,
          rating: Number((raw.vote_average || 0).toFixed(1)),
          ratingSource: 'TMDB' as const,
          voteCount: raw.vote_count || 0,
        };
      });
    } catch (err: any) {
      console.error('[TMDB] Search error:', err.message ?? err);
      return [];
    }
  }
}

export async function searchTMDBMovies(query: string): Promise<Movie[]> {
  const provider = new TMDBMovieProvider();
  return provider.searchMovies(query);
}

