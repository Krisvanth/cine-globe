# CineGlobe 🌍🎬

> **One spin. One country. One movie.**

**CineGlobe** is a production-quality, immersive world-cinema discovery web application designed for film enthusiasts who struggle to decide which movie to watch.

Users interact with a 3D Earth, spin the globe, land on a country with a cinematic camera zoom, and discover a celebrated film originating from that country's production heritage. Users can configure pre-spin filters, check regional streaming availability, log watched films with personal ratings, save to a watchlist, and test their film knowledge in the Cine Quiz with three lives and an anti-cheat leaderboard.

---

## 🌟 Key Features

### 1. Interactive 3D World Cinema Globe
- **Custom Three.js WebGL Earth**: Atmospheric glow shader, twinkling starfield, and country landing coordinates.
- **Natural Physics**: Touch and mouse rotation with inertia, momentum, and friction.
- **Cinematic Landing**: Acceleration and smooth quintic deceleration that deterministically stops directly at the target country's latitude/longitude and smoothly zooms in.
- **Accessible Atlas Mode**: Fallback 2.5D interactive world map for reduced-motion preferences or environments without WebGL.
- **GPU Optimization**: Low memory footprint with idle loop pause to conserve system resources.

### 2. Pre-Spin Recommendation Filters
- Filter by **Genre** (Action, Drama, Comedy, Thriller, Animation, Romance, Mystery, etc.).
- Filter by **Original Language** (`ja`, `ko`, `fr`, `es`, `hi`, `it`, `de`, `pt`, `sv`, `da`, `fa`, `zh`, etc.).
- Filter by **Minimum TMDB Rating** (7.0+, 7.5+, 8.0+, 8.5+).
- Filter by **Maximum Runtime** (< 100m, < 120m, < 150m).
- Toggle **Discovery Scope**: All Films, Hidden Gems (high rating, lower popularity), or Celebrated Classics.
- Select your **Viewing Region** for streaming lookup.
- Active filter pill badges with single-click dismiss and "Reset Filters".

### 3. Movie Reveal & Regional Streaming Availability
- Editorial cinema presentation: poster art, title, original title, release year, runtime, genres, director, and key cast.
- **Strict Production Country Matching**: Movies are only recommended if their production country metadata genuinely matches the selected nation.
- **Verified Rating Attribution**: Attributed directly to TMDB with vote count. Never fabricates or misattributes ratings.
- **Regional Streaming Availability (JustWatch / TMDB Watch Providers)**: Real regional lookup distinguishing subscription (flatrate), rental, purchase, and free offers.
- **Actions**: "Spin Again", "Save to Watchlist", "Mark as Watched", and "Share Discovery".

### 4. Cine Quiz Arena (3 Lives)
- **Gameplay**: Start a session with exactly 3 lives.
- **Scoring**: 100 points per correct answer; 1 life lost per incorrect answer.
- **Streak Bonus**: +25 bonus points every 5 consecutive correct answers.
- **Server-Side Scoring**: Answer keys are never sent to the client. Question attempts are validated and scored on the server to prevent client manipulation and replay attacks.
- **Question Bank**: Verified film knowledge covering directors, production countries, film awards (Palme d'Or, Oscars), actors, and world cinema history.
- **Game Over & Confetti**: Detailed round review (score, accuracy %, correct count, longest streak).

### 5. Global Leaderboard
- **Dual Views**: Daily Masters and All-Time Champions.
- **Ranking Policy**: 1. Highest Score, 2. Most Correct Answers, 3. Fastest Time.
- **Privacy First**: Exposes only public usernames and avatars; never leaks emails or private IDs.

### 6. Watchlist & Watched Films Log
- **Watchlist**: Search, filter, and sort saved films by rating, date, or year.
- **Watched History**: Record personal ratings from 1 to 10 stars, watch dates, and view cinema journey metrics (e.g. total countries discovered).
- **Cross-Collection Consistency**: Marking a watchlisted film as watched automatically updates both collections consistently.
- **Dual Persistence Architecture**: Works out of the box in **Guest Local Mode** (offline-ready via localStorage) and connects seamlessly to **Supabase Auth & PostgreSQL** when credentials are configured.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) & TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism and gold aesthetic tokens
- **3D Graphics**: Three.js WebGL canvas
- **Validation**: Zod schema validation on all API requests
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth with Google OAuth
- **Icons**: Lucide React
- **Testing**: Vitest, jsdom, React Testing Library
- **Deployment**: Vercel

---

## 📁 Repository Structure

```
CineGlobe/
├── app/
│   ├── api/
│   │   ├── availability/      # Regional OTT streaming availability
│   │   ├── countries/         # Catalogued countries list
│   │   ├── discover/          # Movie discovery recommendation engine
│   │   ├── leaderboard/       # Public safe leaderboard rankings
│   │   ├── me/
│   │   │   ├── watched/       # User watched films (GET/POST/DELETE)
│   │   │   └── watchlist/     # User watchlist (GET/POST/DELETE)
│   │   └── quiz/
│   │       ├── start/         # Starts session, returns question sans answer
│   │       ├── answer/        # Server-side answer validation & scoring
│   │       └── finish/        # Finalizes completed quiz session
│   ├── auth/callback/         # Supabase Google OAuth callback
│   ├── leaderboard/           # Leaderboard page
│   ├── quiz/                  # Cine Quiz arena page
│   ├── watched/               # Watched history page
│   ├── watchlist/             # Watchlist page
│   ├── globals.css            # Cinematic theme tokens & glassmorphism
│   ├── layout.tsx             # Root layout with SEO metadata & viewport
│   └── page.tsx               # Homepage with 3D Globe & discovery hero
├── components/
│   ├── auth/                  # AuthModal & Supabase login status
│   ├── filters/               # FilterPanel & FilterBadgeBar
│   ├── globe/                 # GlobeScene (Three.js), GlobeControls, GlobeFallback
│   ├── layout/                # Navbar & Footer
│   ├── library/               # WatchlistPage & WatchedFilmsPage
│   ├── movie/                 # MovieRevealModal, StreamingModal, MarkWatchedModal
│   └── quiz/                  # QuizGame arena & Leaderboard component
├── data/
│   ├── countries.ts           # 45+ ISO 3166-1 countries with coordinates & cinema lore
│   ├── quizQuestions.ts       # Curated verified world cinema question bank
│   └── verifiedMovies.ts      # Real world cinema database with verified TMDB metadata
├── lib/
│   ├── guest/                 # Guest localStorage manager with cross-sync
│   ├── movies/                # Recommendation engine & TMDB live provider
│   ├── quiz/                  # Server-side quiz session manager
│   ├── streaming/             # Regional OTT streaming provider adapter
│   ├── supabase/              # Browser & Server Supabase clients
│   └── validation/            # Zod validation schemas
├── supabase/migrations/       # PostgreSQL DDL migrations & RLS policies
└── tests/                     # Vitest test suite (18 unit/integration tests)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with v22.14.0)
- npm 9+

### 2. Installation
```bash
git clone https://github.com/your-username/CineGlobe.git
cd CineGlobe
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TMDB_API_KEY=your-tmdb-v3-api-key
```
*(Note: If TMDB or Supabase are not configured, CineGlobe gracefully operates in its verified offline catalogue and guest mode!)*

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Execute the unit and integration test suite:
```bash
npm run test
```

Build the production bundle to verify types and Next.js routes:
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

To enable cross-device account syncing, run the migration in `supabase/migrations/20261017000001_initial_schema.sql` in your Supabase SQL Editor:
1. Creates `profiles`, `watchlist`, `watched_films`, `quiz_questions`, `quiz_sessions`, and `quiz_answers`.
2. Enables Row Level Security (RLS) on all user-owned tables.
3. Sets up the secure `leaderboard_public` view.

---

## ☁️ Vercel Deployment

1. Push your repository to GitHub / GitLab.
2. Import the project in your Vercel Dashboard.
3. Add the environment variables from `.env.local`.
4. Deploy! Next.js App Router and dynamic route handlers are optimized for Vercel Edge/Serverless execution.

---

## 📜 License
CineGlobe is a non-commercial cultural project dedicated to global storytelling and world cinema discovery. Movie metadata is provided by TMDB and JustWatch.
