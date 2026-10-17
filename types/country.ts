export interface Country {
  code: string; // ISO 3166-1 alpha-2, e.g. "FR", "JP"
  name: string;
  lat: number;
  lon: number;
  continent: string;
  flagEmoji: string;
  primaryLanguage: string;
  cinemaTradition?: string; // brief cinematic heritage note
}

export interface GlobeCoordinates {
  lat: number;
  lon: number;
}
