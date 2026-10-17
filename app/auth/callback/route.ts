import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

if (typeof process !== 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.warn('[Auth Callback] OAuth provider error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Pre-create the destination redirect response so we can attach session cookies to it
  const response = NextResponse.redirect(`${origin}/?auth_success=true`);

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('[Auth Callback] Failed to exchange code for session:', exchangeError);
        return NextResponse.redirect(
          `${origin}/?auth_error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      console.log('[Auth Callback] Session created successfully for user:', data.user?.id);

      // Best-effort profile initialization (non-blocking)
      if (data?.user) {
        try {
          const username =
            data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] ||
            `cinephile_${data.user.id.substring(0, 6)}`;
          const avatarUrl =
            data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;

          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              username,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[Auth Callback] Profile upsert notice:', profileErr);
        }
      }

      // Return the response with all Set-Cookie headers attached
      return response;
    } catch (err: any) {
      console.error('[Auth Callback] Code exchange exception:', err);
      return NextResponse.redirect(
        `${origin}/?auth_error=${encodeURIComponent(err.message || 'Auth failure')}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
