-- CineGlobe Database Schema & Security Migration
-- Version: 20261017000001

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. WATCHLIST TABLE
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_external_id TEXT NOT NULL,
  movie_source TEXT NOT NULL DEFAULT 'TMDB',
  movie_snapshot JSONB,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_watchlist_movie UNIQUE (user_id, movie_external_id, movie_source)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_added_at ON public.watchlist(added_at DESC);

-- Watchlist RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist."
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist."
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist."
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- 3. WATCHED FILMS TABLE
CREATE TABLE IF NOT EXISTS public.watched_films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_external_id TEXT NOT NULL,
  movie_source TEXT NOT NULL DEFAULT 'TMDB',
  watched_at DATE DEFAULT CURRENT_DATE NOT NULL,
  personal_rating NUMERIC(3, 1) CHECK (personal_rating IS NULL OR (personal_rating >= 1.0 AND personal_rating <= 10.0)),
  review_notes TEXT,
  movie_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_watched_movie UNIQUE (user_id, movie_external_id, movie_source)
);

CREATE INDEX IF NOT EXISTS idx_watched_films_user_id ON public.watched_films(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_films_watched_at ON public.watched_films(watched_at DESC);

-- Watched Films RLS
ALTER TABLE public.watched_films ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watched films."
  ON public.watched_films FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watched films."
  ON public.watched_films FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched films."
  ON public.watched_films FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watched films."
  ON public.watched_films FOR DELETE
  USING (auth.uid() = user_id);

-- 4. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option >= 0 AND correct_option <= 3),
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Secure Quiz Questions RLS: normal clients cannot read correct answers directly!
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Note: client access to quiz questions is handled strictly via trusted server routes.
-- Service role has full access.

-- 5. QUIZ SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  lives_remaining INTEGER DEFAULT 3 NOT NULL,
  correct_answers INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_score ON public.quiz_sessions(score DESC, correct_answers DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON public.quiz_sessions(completed_at DESC);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz sessions."
  ON public.quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- 6. QUIZ ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.quiz_questions(id),
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_session_question_answer UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON public.quiz_answers(session_id);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- 7. SAFE PUBLIC LEADERBOARD VIEW
CREATE OR REPLACE VIEW public.leaderboard_public AS
SELECT
  s.id AS session_id,
  COALESCE(p.username, 'Anonymous Cinephile') AS username,
  p.avatar_url,
  s.score,
  s.correct_answers,
  s.longest_streak,
  s.completed_at,
  EXTRACT(EPOCH FROM (s.completed_at - s.started_at))::INTEGER AS duration_seconds,
  DENSE_RANK() OVER (ORDER BY s.score DESC, s.correct_answers DESC, (s.completed_at - s.started_at) ASC) AS rank
FROM public.quiz_sessions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.status = 'completed' AND s.score > 0
ORDER BY s.score DESC, s.correct_answers DESC, (s.completed_at - s.started_at) ASC;

-- Grant select on public view
GRANT SELECT ON public.leaderboard_public TO anon, authenticated;
