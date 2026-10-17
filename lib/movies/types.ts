import { Movie, RecommendationFilters } from '@/types/movie';

export interface MovieProvider {
  name: string;
  isAvailable(): boolean;
  getMoviesByCountry(
    countryCode: string,
    filters?: RecommendationFilters
  ): Promise<Movie[]>;
  getMovieDetails(id: string | number): Promise<Movie | null>;
  searchMovies?(query: string): Promise<Movie[]>;
}
