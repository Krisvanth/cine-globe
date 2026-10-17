'use client';

import React from 'react';

export interface MovieCharacterAvatar {
  id: string;
  name: string;
  film: string;
  gender?: 'character';
  accentColor: string;
  render: (size?: number) => React.ReactNode;
}

export const MOVIE_AVATARS: MovieCharacterAvatar[] = [
  // ===========================================================================
  // ROW 1: THE BLOCKBUSTER ICONS (5 CHARACTERS)
  // ===========================================================================

  // 1. SPIDER-MAN
  {
    id: 'char-spiderman',
    name: 'Spider-Man',
    film: 'Spider-Man',
    gender: 'character',
    accentColor: '#ef4444',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="spidey-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#991b1b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="spidey-suit" x1="20" y1="70" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dc2626" />
            <stop offset="1" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#spidey-bg)" stroke="#ef4444" strokeWidth="2.5" />

        {/* Shoulders & Suit */}
        <path d="M22 100 L32 74 L50 80 L68 74 L78 100 Z" fill="#0369a1" />
        <path d="M36 75 L50 82 L64 75 L60 100 L40 100 Z" fill="url(#spidey-suit)" />
        <line x1="50" y1="82" x2="50" y2="100" stroke="#09090b" strokeWidth="1.5" />
        <line x1="43" y1="88" x2="57" y2="88" stroke="#09090b" strokeWidth="1.5" />
        <line x1="41" y1="96" x2="59" y2="96" stroke="#09090b" strokeWidth="1.5" />

        <rect x="44" y="60" width="12" height="14" rx="2" fill="#dc2626" />
        <line x1="50" y1="60" x2="50" y2="74" stroke="#09090b" strokeWidth="1.2" />

        <ellipse cx="50" cy="48" rx="19" ry="22" fill="#ef4444" />

        {/* Web Pattern */}
        <line x1="50" y1="26" x2="50" y2="70" stroke="#09090b" strokeWidth="1.5" />
        <path d="M32 44 Q50 49 68 44" stroke="#09090b" strokeWidth="1.4" fill="none" />
        <path d="M34 56 Q50 61 66 56" stroke="#09090b" strokeWidth="1.4" fill="none" />
        <path d="M36 36 Q50 40 64 36" stroke="#09090b" strokeWidth="1.4" fill="none" />
        <path d="M38 65 Q50 69 62 65" stroke="#09090b" strokeWidth="1.2" fill="none" />
        <line x1="50" y1="48" x2="34" y2="34" stroke="#09090b" strokeWidth="1.3" />
        <line x1="50" y1="48" x2="66" y2="34" stroke="#09090b" strokeWidth="1.3" />
        <line x1="50" y1="48" x2="34" y2="62" stroke="#09090b" strokeWidth="1.3" />
        <line x1="50" y1="48" x2="66" y2="62" stroke="#09090b" strokeWidth="1.3" />

        {/* Expressive Lenses */}
        <path
          d="M33 42 C42 43, 47 48, 47 54 C40 55, 34 50, 33 42 Z"
          fill="#ffffff"
          stroke="#09090b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M36 44 Q43 45 44 48" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />

        <path
          d="M67 42 C58 43, 53 48, 53 54 C60 55, 66 50, 67 42 Z"
          fill="#ffffff"
          stroke="#09090b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M64 44 Q57 45 56 48" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
      </svg>
    ),
  },

  // 2. BATMAN
  {
    id: 'char-batman',
    name: 'Batman',
    film: 'The Dark Knight',
    gender: 'character',
    accentColor: '#fbbf24',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="bat-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#09090b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bat-bg)" stroke="#fbbf24" strokeWidth="2.5" />

        <polygon points="34,42 31,18 43,33" fill="#18181b" />
        <polygon points="66,42 69,18 57,33" fill="#18181b" />

        <path d="M22 100 L32 74 L50 80 L68 74 L78 100 Z" fill="#27272a" />
        <path
          d="M42 84 C45 88, 50 86, 50 89 C50 86, 55 88, 58 84 C54 86, 50 81, 50 81 C50 81, 46 86, 42 84 Z"
          fill="#fbbf24"
        />

        <ellipse cx="50" cy="47" rx="19" ry="21" fill="#18181b" />

        <polygon points="41,56 59,56 56,66 44,66" fill="#fde68a" />
        <line x1="45" y1="62" x2="55" y2="62" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="48,50 52,50 50,56" fill="#09090b" />

        <polygon points="37,46 46,49 44,52 38,50" fill="#ffffff" />
        <polygon points="63,46 54,49 56,52 62,50" fill="#ffffff" />
        <path d="M36 43 L47 47" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
        <path d="M64 43 L53 47" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 3. HARLEY QUINN (MOVED TO FIRST ROW)
  {
    id: 'char-harley',
    name: 'Harley Quinn',
    film: 'The Suicide Squad',
    gender: 'character',
    accentColor: '#ec4899',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="harley-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#831843" />
            <stop offset="0.5" stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="harley-pink-pigtail" x1="15" y1="35" x2="15" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.4" stopColor="#f472b6" />
            <stop offset="1" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="harley-blue-pigtail" x1="85" y1="35" x2="85" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.4" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#harley-bg)" stroke="#ec4899" strokeWidth="2.5" />

        {/* Left Pigtail */}
        <path
          d="M26 36 C16 36, 12 50, 14 74 C16 75, 20 72, 21 64 C23 54, 25 45, 29 42 Z"
          fill="url(#harley-pink-pigtail)"
        />
        <ellipse cx="28" cy="38" rx="3.5" ry="2" fill="#18181b" transform="rotate(-20 28 38)" />

        {/* Right Pigtail */}
        <path
          d="M74 36 C84 36, 88 50, 86 74 C84 75, 80 72, 79 64 C77 54, 75 45, 71 42 Z"
          fill="url(#harley-blue-pigtail)"
        />
        <ellipse cx="72" cy="38" rx="3.5" ry="2" fill="#18181b" transform="rotate(20 72 38)" />

        {/* Jacket & Tee */}
        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#09090b" />
        <path d="M22 100 L32 76 L44 79 L38 100 Z" fill="#e11d48" />
        <polygon points="42,78 50,92 58,78" fill="#ffffff" />
        <polygon points="44,78 50,84 56,78" fill="#e11d48" />

        <rect x="44" y="66" width="12" height="3" fill="#18181b" />
        <circle cx="50" cy="67.5" r="1.5" fill="#fbbf24" />
        <rect x="44" y="58" width="12" height="10" rx="2" fill="#fff1f2" />

        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fff1f2" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fff1f2" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fff1f2" />

        {/* Blonde Bangs */}
        <path
          d="M30 40 C32 22, 46 19, 50 20 C54 19, 68 22, 70 40 C65 32, 58 29, 50 33 C42 29, 35 32, 30 40 Z"
          fill="#fef08a"
        />
        <path d="M31 38 C29 46, 32 54, 30 58" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M69 38 C71 46, 68 54, 70 58" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Two-tone Eyeshadow */}
        <path d="M38 46 Q42 42 46 45 Q44 54 41 53 Z" fill="#f43f5e" fillOpacity="0.5" />
        <path d="M54 45 Q58 42 62 46 Q59 54 56 53 Z" fill="#06b6d4" fillOpacity="0.5" />

        <ellipse cx="42" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <ellipse cx="58" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <circle cx="42" cy="47" r="1.3" fill="#0284c7" />
        <circle cx="58" cy="47" r="1.3" fill="#0284c7" />
        <circle cx="43" cy="46" r="0.7" fill="#fff" />
        <circle cx="59" cy="46" r="0.7" fill="#fff" />
        <path d="M37 45 L45 44" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M63 45 L55 44" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

        {/* Heart Tattoo */}
        <path
          d="M62 52 C61.2 50.8, 59.8 51.5, 61 53 L62 54.2 L63 53 C64.2 51.5, 62.8 50.8, 62 52 Z"
          fill="#18181b"
        />
        <path d="M44 58 Q52 64 58 57" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // 4. WONDER WOMAN (NEW)
  {
    id: 'char-wonderwoman',
    name: 'Wonder Woman',
    film: 'Wonder Woman',
    gender: 'character',
    accentColor: '#eab308',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="ww-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#881337" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ww-bg)" stroke="#fbbf24" strokeWidth="2.5" />

        {/* Amazonian Armor Bodice */}
        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#991b1b" />
        {/* Golden Eagle Breastplate */}
        <path
          d="M34 76 Q50 85 66 76 L62 82 Q50 89 38 82 Z"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="0.8"
        />

        {/* Flowing Raven Hair Behind Head */}
        <path
          d="M24 46 C20 62, 24 82, 28 92 C32 82, 30 64, 32 46 Z"
          fill="#18181b"
        />
        <path
          d="M76 46 C80 62, 76 82, 72 92 C68 82, 70 64, 68 46 Z"
          fill="#18181b"
        />

        {/* Neck & Face */}
        <rect x="44" y="60" width="12" height="12" rx="2" fill="#fde68a" />
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        {/* Dark Waves Front Hair */}
        <path
          d="M32 38 C34 22, 46 20, 50 24 C54 20, 66 22, 68 38 C62 30, 56 28, 50 32 C44 28, 38 30, 32 38 Z"
          fill="#18181b"
        />

        {/* Iconic Golden Tiara with Red Star */}
        <polygon points="34,32 50,22 66,32 50,27" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        {/* Red Star in Center */}
        <polygon points="50,25 51,27.5 53.5,27.5 51.5,29 52,31.5 50,30 48,31.5 48.5,29 46.5,27.5 49,27.5" fill="#dc2626" />

        {/* Piercing Strong Eyes & Brows */}
        <ellipse cx="42" cy="48" rx="3" ry="2.2" fill="#451a03" />
        <ellipse cx="58" cy="48" rx="3" ry="2.2" fill="#451a03" />
        <circle cx="43" cy="47" r="0.8" fill="#fff" />
        <circle cx="59" cy="47" r="0.8" fill="#fff" />
        <path d="M38 44 Q43 42 46 45" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M62 44 Q57 42 54 45" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />

        {/* Confident Smile */}
        <path d="M45 59 Q50 63 55 59" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // 5. IRON MAN (NEW)
  {
    id: 'char-ironman',
    name: 'Iron Man',
    film: 'Iron Man',
    gender: 'character',
    accentColor: '#ef4444',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="iron-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7f1d1d" />
            <stop offset="1" stopColor="#18181b" />
          </linearGradient>
          <linearGradient id="iron-gold" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="1" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iron-bg)" stroke="#ef4444" strokeWidth="2.5" />

        {/* Crimson Armor Torso */}
        <path d="M22 100 L32 74 L50 80 L68 74 L78 100 Z" fill="#b91c1c" />
        <polygon points="32,74 42,74 38,88" fill="#eab308" />
        <polygon points="68,74 58,74 62,88" fill="#eab308" />

        {/* Glowing Arc Reactor */}
        <circle cx="50" cy="88" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="50" cy="88" r="3" fill="#ffffff" />

        {/* Helmet Outer Shell */}
        <path
          d="M28 48 C28 28, 38 20, 50 20 C62 20, 72 28, 72 48 C72 65, 62 70, 50 70 C38 70, 28 65, 28 48 Z"
          fill="#b91c1c"
        />

        {/* Gold Faceplate */}
        <path
          d="M34 40 L44 38 L50 40 L56 38 L66 40 L64 62 L50 67 L36 62 Z"
          fill="url(#iron-gold)"
          stroke="#991b1b"
          strokeWidth="1.2"
        />
        {/* Chin indents */}
        <line x1="44" y1="64" x2="56" y2="64" stroke="#991b1b" strokeWidth="1.5" />

        {/* Glowing Cyan Slit Eyes */}
        <polygon points="38,47 46,47 45,50 39,50" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
        <polygon points="62,47 54,47 55,50 61,50" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
      </svg>
    ),
  },

  // ===========================================================================
  // ROW 2: CINEMATIC TRAILBLAZERS (5 CHARACTERS)
  // ===========================================================================

  // 6. THE BRIDE (KILL BILL - NEW)
  {
    id: 'char-thebride',
    name: 'The Bride',
    film: 'Kill Bill',
    gender: 'character',
    accentColor: '#facc15',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="bride-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#854d0e" />
            <stop offset="1" stopColor="#09090b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bride-bg)" stroke="#facc15" strokeWidth="2.5" />

        {/* Iconic Yellow Tracksuit with Black Stripes */}
        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#facc15" />
        {/* Black side racing stripes */}
        <path d="M26 100 L34 76 L38 77 L30 100 Z" fill="#18181b" />
        <path d="M74 100 L66 76 L62 77 L70 100 Z" fill="#18181b" />
        {/* Black collar snap */}
        <path d="M44 79 L50 84 L56 79" stroke="#18181b" strokeWidth="2" fill="none" />

        {/* Katana Strap */}
        <line x1="30" y1="76" x2="68" y2="100" stroke="#451a03" strokeWidth="3" />

        <rect x="44" y="60" width="12" height="12" rx="2" fill="#fde68a" />
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        {/* Straight Blonde Hair with Bob Bangs */}
        <path
          d="M28 58 L28 36 C28 22, 40 18, 50 18 C60 18, 72 22, 72 36 L72 58 C72 62, 66 62, 66 54 L66 38 C66 30, 58 28, 50 30 C42 28, 34 30, 34 38 L34 54 C34 62, 28 62, 28 58 Z"
          fill="#fde047"
        />
        {/* Blunt Bangs */}
        <path d="M32 36 C36 40, 64 40, 68 36 L68 30 L32 30 Z" fill="#fde047" />

        {/* Fierce Ice-Blue Eyes & Intense Gaze */}
        <ellipse cx="42" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <ellipse cx="58" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <circle cx="42" cy="47" r="1.3" fill="#0284c7" />
        <circle cx="58" cy="47" r="1.3" fill="#0284c7" />
        <circle cx="43" cy="46" r="0.7" fill="#fff" />
        <circle cx="59" cy="46" r="0.7" fill="#fff" />
        <path d="M38 44 L46 46" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M62 44 L54 46" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />

        {/* Resolute Set Jaw */}
        <line x1="45" y1="60" x2="55" y2="60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 7. KATNISS EVERDEEN (HUNGER GAMES - NEW)
  {
    id: 'char-katniss',
    name: 'Katniss',
    film: 'The Hunger Games',
    gender: 'character',
    accentColor: '#f97316',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="kat-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#431407" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#kat-bg)" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Black Arena Tactical Jacket */}
        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#18181b" />
        {/* Golden Mockingjay Pin on Lapel */}
        <circle cx="38" cy="85" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        <path d="M36 85 Q38 82 40 85" stroke="#78350f" strokeWidth="1" fill="none" />

        {/* Signature Dutch Side Braid draped over shoulder */}
        <path d="M66 46 C74 58, 70 76, 72 96" stroke="#451a03" strokeWidth="7" strokeLinecap="round" />
        <rect x="69" y="88" width="6" height="2" fill="#18181b" />

        {/* Neck & Face */}
        <rect x="44" y="60" width="12" height="12" rx="2" fill="#fde68a" />
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        {/* Dark Brown Hair with Side Sweep */}
        <path
          d="M32 40 C34 22, 48 20, 52 22 C64 20, 68 24, 68 40 C62 30, 54 28, 48 34 C44 30, 36 32, 32 40 Z"
          fill="#451a03"
        />

        {/* Archer's Focused Eyes & Brows */}
        <ellipse cx="42" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <ellipse cx="58" cy="47" rx="3" ry="2.2" fill="#1c1917" />
        <circle cx="42" cy="47" r="1.2" fill="#475569" />
        <circle cx="58" cy="47" r="1.2" fill="#475569" />
        <path d="M38 44 Q43 43 46 45" stroke="#291204" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M62 44 Q57 43 54 45" stroke="#291204" strokeWidth="1.8" strokeLinecap="round" />

        {/* Determined expression */}
        <line x1="45" y1="59" x2="55" y2="59" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 8. NEO
  {
    id: 'boy-neo',
    name: 'Neo',
    film: 'The Matrix',
    gender: 'character',
    accentColor: '#10b981',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="neo-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#064e3b" />
            <stop offset="1" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="neo-coat" x1="20" y1="70" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#18181b" />
            <stop offset="1" stopColor="#09090b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#neo-bg)" stroke="#10b981" strokeWidth="2.5" />
        
        <path d="M22 100 L32 72 L45 76 L50 82 L55 76 L68 72 L78 100 Z" fill="url(#neo-coat)" />
        <polygon points="32,72 38,62 48,72 44,78" fill="#27272a" />
        <polygon points="68,72 62,62 52,72 56,78" fill="#27272a" />
        <polygon points="45,74 50,82 55,74" fill="#09090b" />

        <rect x="44" y="58" width="12" height="15" rx="3" fill="#fcd34d" />
        <ellipse cx="50" cy="46" rx="19" ry="21" fill="#fde68a" />
        <ellipse cx="30" cy="48" rx="3.5" ry="5.5" fill="#fde68a" />
        <ellipse cx="70" cy="48" rx="3.5" ry="5.5" fill="#fde68a" />

        <path
          d="M28 42 C28 26, 40 22, 50 22 C62 22, 72 26, 72 42 C72 40, 68 31, 58 31 C50 31, 46 33, 40 33 C33 33, 29 38, 28 42 Z"
          fill="#18181b"
        />

        <rect x="33" y="42" width="14" height="7.5" rx="3" fill="#09090b" stroke="#000" strokeWidth="0.8" />
        <rect x="53" y="42" width="14" height="7.5" rx="3" fill="#09090b" stroke="#000" strokeWidth="0.8" />
        <line x1="47" y1="45" x2="53" y2="45" stroke="#09090b" strokeWidth="2" />
        <line x1="36" y1="44" x2="43" y2="44" stroke="#34d399" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
        <line x1="56" y1="44" x2="63" y2="44" stroke="#34d399" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

        <path d="M49 53 L51 53" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M46 59 Q50 62 54 59" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // 9. MIA WALLACE
  {
    id: 'girl-mia',
    name: 'Mia Wallace',
    film: 'Pulp Fiction',
    gender: 'character',
    accentColor: '#ec4899',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="mia-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#831843" />
            <stop offset="1" stopColor="#4c0519" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#mia-bg)" stroke="#f43f5e" strokeWidth="2.5" />

        <path d="M22 100 L32 76 L50 84 L68 76 L78 100 Z" fill="#09090b" />
        <polygon points="34,76 44,76 41,88" fill="#ffffff" />
        <polygon points="66,76 56,76 59,88" fill="#ffffff" />
        <polygon points="44,76 50,86 56,76" fill="#fde68a" />

        <rect x="45" y="60" width="10" height="12" rx="2" fill="#fde68a" />
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        <path
          d="M26 58 L26 36 C26 22, 40 18, 50 18 C60 18, 74 22, 74 36 L74 58 C74 62, 68 62, 68 54 L68 38 C68 32, 60 30, 50 30 C40 30, 32 32, 32 38 L32 54 C32 62, 26 62, 26 58 Z"
          fill="#18181b"
        />
        <path d="M30 36 C34 40, 66 40, 70 36 L70 30 L30 30 Z" fill="#18181b" />

        <ellipse cx="42" cy="46" rx="3" ry="2" fill="#1c1917" />
        <ellipse cx="58" cy="46" rx="3" ry="2" fill="#1c1917" />
        <path d="M38 45 L45 44" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 45 L55 44" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

        <path d="M44 58 Q50 63 56 58 Q50 61 44 58" fill="#e11d48" />
        <ellipse cx="36" cy="52" rx="3" ry="1.8" fill="#fda4af" fillOpacity="0.5" />
        <ellipse cx="64" cy="52" rx="3" ry="1.8" fill="#fda4af" fillOpacity="0.5" />
      </svg>
    ),
  },

  // 10. HARRY POTTER
  {
    id: 'boy-potter',
    name: 'Harry',
    film: 'Harry Potter',
    gender: 'character',
    accentColor: '#ef4444',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="potter-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7f1d1d" />
            <stop offset="1" stopColor="#450a0a" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#potter-bg)" stroke="#d4af37" strokeWidth="2.5" />

        <path d="M24 100 C28 78, 72 78, 76 100 Z" fill="#1e293b" />
        <path d="M30 76 L70 76 L66 88 L34 88 Z" fill="#b91c1c" />
        <rect x="40" y="76" width="6" height="12" fill="#fbbf24" />
        <rect x="54" y="76" width="6" height="12" fill="#fbbf24" />

        <rect x="44" y="62" width="12" height="12" rx="2" fill="#fde68a" />
        <ellipse cx="50" cy="48" rx="19" ry="20" fill="#fde68a" />
        <ellipse cx="30" cy="50" rx="3" ry="5" fill="#fde68a" />
        <ellipse cx="70" cy="50" rx="3" ry="5" fill="#fde68a" />

        <path
          d="M28 42 C26 26, 44 20, 52 20 C64 20, 74 27, 72 44 C67 36, 61 34, 53 34 C46 34, 42 36, 38 34 C33 34, 29 39, 28 42 Z"
          fill="#1c1917"
        />
        <polygon points="40,24 45,18 48,25" fill="#1c1917" />
        <polygon points="56,23 62,17 64,25" fill="#1c1917" />

        <path d="M45 32 L49 37 L46 38 L51 43" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <circle cx="41" cy="50" r="7.5" stroke="#18181b" strokeWidth="2" fill="#fff" fillOpacity="0.15" />
        <circle cx="59" cy="50" r="7.5" stroke="#18181b" strokeWidth="2" fill="#fff" fillOpacity="0.15" />
        <line x1="48.5" y1="50" x2="51.5" y2="50" stroke="#18181b" strokeWidth="2" />

        <circle cx="41" cy="50" r="2.5" fill="#047857" />
        <circle cx="59" cy="50" r="2.5" fill="#047857" />

        <path d="M46 62 Q50 65 54 62" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // ===========================================================================
  // ROW 3: ICONIC LEGENDS (5 CHARACTERS)
  // ===========================================================================

  // 11. PRINCESS LEIA
  {
    id: 'girl-leia',
    name: 'Princess Leia',
    film: 'Star Wars',
    gender: 'character',
    accentColor: '#8b5cf6',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="leia-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#312e81" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#leia-bg)" stroke="#a78bfa" strokeWidth="2.5" />

        <path d="M22 100 L34 74 L50 80 L66 74 L78 100 Z" fill="#f8fafc" />
        <path d="M34 74 Q50 82 66 74 Q50 78 34 74" fill="#e2e8f0" />

        {/* Double Side Cinnamon Buns */}
        <circle cx="24" cy="46" r="10" fill="#451a03" stroke="#291204" strokeWidth="1.5" />
        <circle cx="76" cy="46" r="10" fill="#451a03" stroke="#291204" strokeWidth="1.5" />
        <path d="M22 43 Q25 48 22 51" stroke="#78350f" strokeWidth="1.5" fill="none" />
        <path d="M78 43 Q75 48 78 51" stroke="#78350f" strokeWidth="1.5" fill="none" />

        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        <path
          d="M32 40 C34 24, 46 22, 50 25 C54 22, 66 24, 68 40 C62 32, 54 30, 50 34 C46 30, 38 32, 32 40 Z"
          fill="#451a03"
        />

        <ellipse cx="42" cy="47" rx="2.8" ry="2" fill="#1c1917" />
        <ellipse cx="58" cy="47" rx="2.8" ry="2" fill="#1c1917" />
        <path d="M39 45 L45 45" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M55 45 L61 45" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />

        <path d="M46 58 Q50 61 54 58" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // 12. JACK SPARROW
  {
    id: 'boy-sparrow',
    name: 'Jack Sparrow',
    film: 'Pirates of the Caribbean',
    gender: 'character',
    accentColor: '#38bdf8',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="jack-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a5f" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#jack-bg)" stroke="#38bdf8" strokeWidth="2.5" />

        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#1e293b" />
        <polygon points="40,78 50,90 60,78" fill="#f8fafc" />

        <ellipse cx="50" cy="50" rx="18" ry="19" fill="#fde68a" />
        <ellipse cx="31" cy="51" rx="3" ry="5" fill="#fde68a" />
        <ellipse cx="69" cy="51" rx="3" ry="5" fill="#fde68a" />
        <circle cx="30" cy="55" r="2.5" stroke="#fbbf24" strokeWidth="1.2" fill="none" />

        <rect x="25" y="44" width="4" height="24" rx="2" fill="#292524" />
        <rect x="71" y="44" width="4" height="24" rx="2" fill="#292524" />
        <rect x="25" y="54" width="4" height="3" fill="#38bdf8" />
        <rect x="71" y="52" width="4" height="3" fill="#fbbf24" />
        <rect x="71" y="60" width="4" height="3" fill="#ef4444" />

        <path d="M27 40 C30 26, 70 26, 73 40 L74 44 C60 41, 40 41, 26 44 Z" fill="#dc2626" />
        <polygon points="72,40 82,44 76,52" fill="#b91c1c" />

        <ellipse cx="42" cy="48" rx="4" ry="3" fill="#1c1917" />
        <ellipse cx="42" cy="48" rx="2" ry="2" fill="#fff" />
        <circle cx="42" cy="48" r="1.3" fill="#451a03" />

        <ellipse cx="58" cy="48" rx="4" ry="3" fill="#1c1917" />
        <ellipse cx="58" cy="48" rx="2" ry="2" fill="#fff" />
        <circle cx="58" cy="48" r="1.3" fill="#451a03" />

        <line x1="47" y1="65" x2="47" y2="74" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="53" y1="65" x2="53" y2="74" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="47" cy="72" r="1.2" fill="#ef4444" />
        <circle cx="53" cy="72" r="1.2" fill="#38bdf8" />

        <path d="M43 60 Q47 58 50 61 Q53 58 57 60" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },

  // 13. WEDNESDAY ADDAMS
  {
    id: 'girl-wednesday',
    name: 'Wednesday',
    film: 'Wednesday',
    gender: 'character',
    accentColor: '#94a3b8',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="wed-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wed-bg)" stroke="#94a3b8" strokeWidth="2.5" />

        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#09090b" />
        <polygon points="36,74 46,74 41,88" fill="#ffffff" />
        <polygon points="64,74 54,74 59,88" fill="#ffffff" />

        <path d="M27 48 C24 64, 28 80, 26 95" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <path d="M73 48 C76 64, 72 80, 74 95" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <rect x="23" y="86" width="6" height="2" fill="#475569" />
        <rect x="71" y="86" width="6" height="2" fill="#475569" />

        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#f8fafc" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#f8fafc" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#f8fafc" />

        <path
          d="M30 44 L30 32 C30 20, 42 18, 50 18 C58 18, 70 20, 70 32 L70 44 C66 36, 56 34, 50 38 C44 34, 34 36, 30 44 Z"
          fill="#0f172a"
        />

        <ellipse cx="42" cy="46" rx="3.2" ry="2.8" fill="#020617" />
        <ellipse cx="58" cy="46" rx="3.2" ry="2.8" fill="#020617" />
        <circle cx="43" cy="45" r="0.8" fill="#fff" />
        <circle cx="59" cy="45" r="0.8" fill="#fff" />

        <line x1="46" y1="58" x2="54" y2="58" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 14. INDIANA JONES
  {
    id: 'boy-indy',
    name: 'Indy',
    film: 'Indiana Jones',
    gender: 'character',
    accentColor: '#f59e0b',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="indy-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#78350f" />
            <stop offset="1" stopColor="#451a03" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#indy-bg)" stroke="#f59e0b" strokeWidth="2.5" />

        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#713f12" />
        <polygon points="40,77 50,92 60,77" fill="#fef08a" />
        <polygon points="32,76 42,76 38,88" fill="#451a03" />
        <polygon points="68,76 58,76 62,88" fill="#451a03" />

        <ellipse cx="50" cy="52" rx="18" ry="19" fill="#fde68a" />
        <ellipse cx="31" cy="53" rx="3" ry="5" fill="#fde68a" />
        <ellipse cx="69" cy="53" rx="3" ry="5" fill="#fde68a" />

        <path d="M38 58 Q50 68 62 58 Q50 72 38 58" fill="#d97706" fillOpacity="0.25" />

        <ellipse cx="42" cy="50" rx="2.5" ry="2" fill="#451a03" />
        <ellipse cx="58" cy="50" rx="2.5" ry="2" fill="#451a03" />
        <path d="M38 46 Q43 44 46 47" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M54 47 Q57 43 62 45" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />

        <path d="M45 62 Q52 65 57 60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />

        <ellipse cx="50" cy="38" rx="32" ry="7" fill="#451a03" />
        <path d="M30 38 L34 19 Q50 22 66 19 L70 38 Z" fill="#713f12" />
        <ellipse cx="50" cy="20" rx="10" ry="3" fill="#451a03" />
        <path d="M31 38 L32 34 Q50 36 68 34 L69 38 Z" fill="#1c1917" />
      </svg>
    ),
  },

  // 15. HERMIONE GRANGER
  {
    id: 'girl-hermione',
    name: 'Hermione',
    film: 'Harry Potter',
    gender: 'character',
    accentColor: '#f59e0b',
    render: (size = 64) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-full shadow-md"
      >
        <defs>
          <linearGradient id="herm-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#78350f" />
            <stop offset="1" stopColor="#451a03" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#herm-bg)" stroke="#fbbf24" strokeWidth="2.5" />

        <path d="M22 100 L32 76 L50 82 L68 76 L78 100 Z" fill="#1e293b" />
        <path d="M32 76 L68 76 L64 88 L36 88 Z" fill="#b91c1c" />
        <rect x="42" y="76" width="5" height="12" fill="#fbbf24" />
        <rect x="53" y="76" width="5" height="12" fill="#fbbf24" />

        <circle cx="30" cy="45" r="14" fill="#78350f" />
        <circle cx="70" cy="45" r="14" fill="#78350f" />
        <circle cx="32" cy="58" r="12" fill="#78350f" />
        <circle cx="68" cy="58" r="12" fill="#78350f" />

        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#fde68a" />
        <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#fde68a" />
        <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#fde68a" />

        <path
          d="M32 38 C34 22, 46 20, 50 22 C54 20, 66 22, 68 38 C62 30, 54 28, 50 32 C46 28, 38 30, 32 38 Z"
          fill="#92400e"
        />

        <ellipse cx="42" cy="47" rx="3" ry="2.2" fill="#451a03" />
        <ellipse cx="58" cy="47" rx="2.2" ry="2.2" fill="#451a03" />
        <circle cx="43" cy="46" r="0.9" fill="#fff" />
        <circle cx="59" cy="46" r="0.9" fill="#fff" />

        <circle cx="39" cy="52" r="0.7" fill="#b45309" opacity="0.6" />
        <circle cx="41" cy="53" r="0.7" fill="#b45309" opacity="0.6" />
        <circle cx="59" cy="53" r="0.7" fill="#b45309" opacity="0.6" />
        <circle cx="61" cy="52" r="0.7" fill="#b45309" opacity="0.6" />

        <path d="M45 58 Q50 63 55 58" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
];

export function getMovieAvatarById(id: string): MovieCharacterAvatar {
  if (id === 'spiderman') id = 'char-spiderman';
  if (id === 'batman') id = 'char-batman';
  if (id === 'harley' || id === 'harley-quinn') id = 'char-harley';
  if (id === 'wonderwoman' || id === 'wonder-woman') id = 'char-wonderwoman';
  if (id === 'thebride' || id === 'the-bride' || id === 'beatrix') id = 'char-thebride';
  if (id === 'ironman' || id === 'iron-man') id = 'char-ironman';
  if (id === 'katniss' || id === 'katniss-everdeen') id = 'char-katniss';
  return MOVIE_AVATARS.find((a) => a.id === id) || MOVIE_AVATARS[0];
}
