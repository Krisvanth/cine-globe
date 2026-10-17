import { NextRequest, NextResponse } from 'next/server';
import { watchedAddSchema, watchedDeleteSchema } from '@/lib/validation/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      items: [],
      mode: 'guest_local_recommended',
      message: 'Supabase unconfigured; using guest client persistence.',
    });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database client error' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('watched_films')
    .select('*')
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, items: data });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      mode: 'guest',
      message: 'Recorded in guest state.',
    });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database client error' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parse = watchedAddSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
    }

    const { movieExternalId, movieSource, watchedAt, personalRating, movieSnapshot } = parse.data;

    // 1. Upsert into watched_films
    const { data, error } = await supabase
      .from('watched_films')
      .upsert(
        {
          user_id: user.id,
          movie_external_id: String(movieExternalId),
          movie_source: movieSource,
          watched_at: watchedAt || new Date().toISOString().split('T')[0],
          personal_rating: personalRating,
          movie_snapshot: movieSnapshot,
        },
        { onConflict: 'user_id,movie_external_id,movie_source' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Remove from watchlist for cross-collection consistency
    await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_external_id', String(movieExternalId));

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mode: 'guest' });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database client error' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parse = watchedDeleteSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
    }

    const { error } = await supabase
      .from('watched_films')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_external_id', String(parse.data.movieExternalId));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
