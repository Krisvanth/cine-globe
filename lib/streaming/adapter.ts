import { RegionalStreamingAvailability, StreamingOffer, OfferType } from '@/types/movie';
import { tmdbGet, getTMDBAuth } from '@/lib/movies/tmdbAdapter';

export interface StreamingProvider {
  name: string;
  getAvailability(
    movieId: string | number,
    regionCode: string
  ): Promise<RegionalStreamingAvailability>;
}

export class TMDBStreamingProvider implements StreamingProvider {
  name = 'TMDB Watch Providers (JustWatch)';

  isConfigured(): boolean {
    return getTMDBAuth() !== null;
  }

  async getAvailability(
    movieId: string | number,
    regionCode: string
  ): Promise<RegionalStreamingAvailability> {
    const region = regionCode.toUpperCase();
    const now = new Date().toISOString();
    const auth = getTMDBAuth();

    // 1. If TMDB credentials configured, query TMDB watch providers endpoint via custom DNS
    if (auth) {
      try {
        const cleanId = typeof movieId === 'string' ? movieId.replace('tmdb-', '') : movieId;
        let url = `https://api.themoviedb.org/3/movie/${cleanId}/watch/providers`;
        if (auth.apiKeyParam) {
          url += `?api_key=${auth.apiKeyParam}`;
        }
        const data = await tmdbGet(url, auth.headers);
        const regionData = data?.results?.[region];

          if (regionData) {
            const offers: StreamingOffer[] = [];

            if (Array.isArray(regionData.flatrate)) {
              for (const p of regionData.flatrate) {
                offers.push({
                  providerId: p.provider_id,
                  providerName: p.provider_name,
                  providerLogo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : undefined,
                  offerType: 'flatrate',
                  directUrl: regionData.link,
                });
              }
            }

            if (Array.isArray(regionData.rent)) {
              for (const p of regionData.rent) {
                offers.push({
                  providerId: p.provider_id,
                  providerName: p.provider_name,
                  providerLogo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : undefined,
                  offerType: 'rent',
                  directUrl: regionData.link,
                });
              }
            }

            if (Array.isArray(regionData.buy)) {
              for (const p of regionData.buy) {
                offers.push({
                  providerId: p.provider_id,
                  providerName: p.provider_name,
                  providerLogo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : undefined,
                  offerType: 'buy',
                  directUrl: regionData.link,
                });
              }
            }

            if (Array.isArray(regionData.free)) {
              for (const p of regionData.free) {
                offers.push({
                  providerId: p.provider_id,
                  providerName: p.provider_name,
                  providerLogo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : undefined,
                  offerType: 'free',
                  directUrl: regionData.link,
                });
              }
            }

            return {
              regionCode: region,
              regionName: region,
              offers,
              lastChecked: now,
              attribution: 'Streaming Availability (Powered by JustWatch)',
              isConfigured: true,
            };
          }
      } catch (err) {
        console.warn('[StreamingAdapter] TMDB watch provider query failed:', err);
      }
    }

    // 2. Return live availability or empty offers if none listed on TMDB
    return {
      regionCode: region,
      regionName: region,
      offers: [],
      lastChecked: now,
      attribution: this.isConfigured()
        ? 'No streaming offers currently listed for this title in this region'
        : 'Streaming provider credentials pending configuration in .env',
      isConfigured: this.isConfigured(),
    };
  }
}

export const defaultStreamingProvider = new TMDBStreamingProvider();
