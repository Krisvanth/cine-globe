import { NextRequest, NextResponse } from 'next/server';
import { discoverRequestSchema } from '@/lib/validation/schemas';
import { discoverMovieForCountry } from '@/lib/movies/recommendationEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = discoverRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { countryCode, filters, excludeIds } = parseResult.data;

    const recommendation = await discoverMovieForCountry(
      countryCode,
      filters,
      excludeIds
    );

    return NextResponse.json({
      success: true,
      ...recommendation,
    });
  } catch (error: any) {
    console.error('[API /api/discover] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process movie recommendation',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
