import { describe, it, expect } from 'vitest';
import { defaultStreamingProvider } from '@/lib/streaming/adapter';

describe('Streaming Availability Adapter', () => {
  it('handles movie availability query gracefully without throwing', async () => {
    const availability = await defaultStreamingProvider.getAvailability('tmdb-11', 'US');
    expect(availability).toBeDefined();
    expect(availability.regionCode).toBe('US');
    expect(Array.isArray(availability.offers)).toBe(true);
    expect(availability.attribution).toBeDefined();
  });

  it('handles unknown movie gracefully with empty offers', async () => {
    const availability = await defaultStreamingProvider.getAvailability('unknown-id', 'FR');
    expect(availability).toBeDefined();
    expect(availability.regionCode).toBe('FR');
    expect(availability.offers).toEqual([]);
    expect(availability.attribution).toBeDefined();
  });
});
