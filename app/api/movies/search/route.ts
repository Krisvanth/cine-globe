import { NextRequest, NextResponse } from 'next/server';
import { searchTMDBMovies } from '@/lib/movies/tmdbAdapter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim() || q.trim().length < 2) {
      return NextResponse.json({ success: true, movies: [] });
    }

    const movies = await searchTMDBMovies(q.trim());
    return NextResponse.json({ success: true, movies });
  } catch (error: any) {
    console.error('[API /api/movies/search] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed', movies: [] },
      { status: 500 }
    );
  }
}
