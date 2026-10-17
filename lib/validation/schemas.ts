import { z } from 'zod';

export const recommendationFiltersSchema = z.object({
  genre: z.string().optional(),
  language: z.string().optional(),
  minRating: z.number().min(0).max(10).optional(),
  maxRuntime: z.number().min(1).max(600).optional(),
  minYear: z.number().min(1890).max(2035).optional(),
  maxYear: z.number().min(1890).max(2035).optional(),
  hiddenGemsOnly: z.boolean().optional(),
  popularOnly: z.boolean().optional(),
  viewingRegion: z.string().length(2).optional(),
});

export const discoverRequestSchema = z.object({
  countryCode: z.string().min(2).max(2).toUpperCase(),
  filters: recommendationFiltersSchema.optional(),
  excludeIds: z.array(z.string()).optional().default([]),
});

export const quizStartSchema = z.object({
  userId: z.string().optional(),
});

export const quizAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export const quizFinishSchema = z.object({
  sessionId: z.string().min(1),
});

export const watchlistAddSchema = z.object({
  movieExternalId: z.union([z.string(), z.number()]),
  movieSource: z.enum(['TMDB', 'CURATED']).default('CURATED'),
  movieSnapshot: z.any().optional(),
});

export const watchlistDeleteSchema = z.object({
  movieExternalId: z.union([z.string(), z.number()]),
});

export const watchedAddSchema = z.object({
  movieExternalId: z.union([z.string(), z.number()]),
  movieSource: z.enum(['TMDB', 'CURATED']).default('CURATED'),
  watchedAt: z.string().optional(),
  personalRating: z.number().min(1).max(10).optional(),
  movieSnapshot: z.any().optional(),
});

export const watchedDeleteSchema = z.object({
  movieExternalId: z.union([z.string(), z.number()]),
});

export const availabilityQuerySchema = z.object({
  id: z.string().min(1),
  region: z.string().length(2).toUpperCase().default('US'),
});
