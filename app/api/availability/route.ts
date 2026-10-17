import { NextRequest, NextResponse } from 'next/server';
import { defaultStreamingProvider } from '@/lib/streaming/adapter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const region = searchParams.get('region') || 'US';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing movie id parameter' },
        { status: 400 }
      );
    }

    const availability = await defaultStreamingProvider.getAvailability(id, region);

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error: any) {
    console.error('[API /api/availability] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch regional streaming availability',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
