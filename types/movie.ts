export type RatingSource = 'TMDB' | 'IMDb' | 'Letterboxd' | 'Metacritic';

export type OfferType = 'flatrate' | 'rent' | 'buy' | 'free' | 'ads';

export interface StreamingOffer {
  providerId: number | string;
  providerName: string;
  providerLogo?: string;
  offerType: OfferType;
  price?: string;
  directUrl?: string;
}

export interface RegionalStreamingAvailability {
  regionCode: string; // ISO 3166-1 alpha-2 e.g. "US", "GB", "IN"
  regionName: string;
  offers: StreamingOffer[];
  lastChecked: string;
  attribution: string;
  isConfigured: boolean;
}

export interface Movie {
  id: string; // Internal or normalized ID
  externalId: number | string; // e.g. TMDB ID 157336
  externalSource: 'TMDB' | 'CURATED';
  title: string;
  originalTitle?: string;
  releaseYear: number;
  productionCountries: string[]; // ISO 3166-1 alpha-2 codes e.g. ["JP"]
  originalLanguage: string; // ISO 639-1 code e.g. "ja"
  genres: string[];
  runtime: number; // in minutes
  synopsis: string;
  posterUrl: string;
  backdropUrl?: string;
  director?: string;
  cast?: string[];
  rating: number; // 0.0 - 10.0
  ratingSource: RatingSource;
  voteCount: number;
  tagline?: string;
  streaming?: Record<string, RegionalStreamingAvailability>; // Keyed by regionCode e.g. "US"
}

export interface RecommendationFilters {
  genre?: string;
  language?: string;
  minRating?: number;
  maxRuntime?: number;
  minYear?: number;
  maxYear?: number;
  hiddenGemsOnly?: boolean; // high rating, lower popularity
  popularOnly?: boolean;
  viewingRegion?: string;
}

export interface DiscoverRequest {
  countryCode: string;
  filters?: RecommendationFilters;
  excludeIds?: string[]; // IDs recently shown in session to prevent immediate repetition
}

export interface DiscoverResponse {
  movie: Movie;
  country: {
    code: string;
    name: string;
    flagEmoji: string;
  };
  filterMatchSummary: string;
  alternativesCount: number;
}
