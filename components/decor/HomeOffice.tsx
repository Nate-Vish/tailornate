/* Decorative home-office illustrations — line-art SVG, aria-hidden.
   Colors ride on CSS vars so they adapt to light/dark themes. */

const ink = "var(--fg)"
const wood = "rgba(139,104,71,0.30)"
const woodSoft = "rgba(139,104,71,0.18)"
const clay = "rgba(139,104,71,0.25)"
const leaf = "#4e8b5f"

export function Shelf() {
  return (
    <svg
      viewBox="0 0 240 150"
      width="230"
      height="144"
      fill="none"
      aria-hidden="true"
      className="shelf-decor"
    >
      {/* trailing pothos */}
      <path d="M30 62c10-10 26-8 30 4" stroke={leaf} strokeWidth="1.5" />
      <ellipse cx="34" cy="58" rx="7" ry="4.5" transform="rotate(-30 34 58)" stroke={leaf} strokeWidth="1.5" />
      <ellipse cx="48" cy="53" rx="7" ry="4.5" transform="rotate(15 48 53)" stroke={leaf} strokeWidth="1.5" />
      <ellipse cx="58" cy="62" rx="6" ry="4" transform="rotate(40 58 62)" stroke={leaf} strokeWidth="1.5" />
      <path d="M32 66h28l-4 18H36z" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      {/* vine trailing below the shelf */}
      <path d="M36 92c-8 14 6 22-2 40" stroke={leaf} strokeWidth="1.5" />
      <ellipse cx="32" cy="102" rx="4.5" ry="3" transform="rotate(-35 32 102)" stroke={leaf} strokeWidth="1.2" />
      <ellipse cx="36" cy="118" rx="4.5" ry="3" transform="rotate(25 36 118)" stroke={leaf} strokeWidth="1.2" />
      <ellipse cx="31" cy="128" rx="4.5" ry="3" transform="rotate(-20 31 128)" stroke={leaf} strokeWidth="1.2" />

      {/* books */}
      <rect x="86" y="56" width="9" height="28" fill={wood} stroke={ink} strokeWidth="1.5" />
      <rect x="97" y="50" width="10" height="34" fill="none" stroke={ink} strokeWidth="1.5" />
      <rect x="109" y="58" width="8" height="26" fill={woodSoft} stroke={ink} strokeWidth="1.5" />
      {/* leaning book */}
      <path d="M121 84l16-30 8 4-16 30z" fill="none" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />

      {/* snake plant */}
      <path d="M162 60c-2-14 2-24 4-30 2 10 2 20 1 30" stroke={leaf} strokeWidth="1.5" />
      <path d="M168 62c0-10 4-18 8-24 0 10-2 18-4 24" stroke={leaf} strokeWidth="1.5" />
      <path d="M158 62c-4-8-5-14-4-20 4 6 6 12 7 18" stroke={leaf} strokeWidth="1.5" />
      <path d="M154 62h24l-3 22h-18z" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />

      {/* coffee mug with steam */}
      <path className="steam" d="M204 48c3-5-3-8 0-13" stroke={ink} strokeWidth="1.2" opacity="0.5" />
      <path className="steam steam-2" d="M212 48c3-5-3-8 0-13" stroke={ink} strokeWidth="1.2" opacity="0.5" />
      <rect x="198" y="58" width="20" height="17" rx="2.5" fill={clay} stroke={ink} strokeWidth="1.5" />
      <path d="M218 62c5 0 5 9 0 9" stroke={ink} strokeWidth="1.5" />

      {/* plank + brackets */}
      <rect x="4" y="85" width="232" height="7" rx="2" fill={wood} stroke={ink} strokeWidth="1.5" />
      <path d="M24 92v10m0-10 10-0M216 92v10m0-10-10 0" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Guitar() {
  return (
    <svg
      viewBox="0 0 150 320"
      width="130"
      height="278"
      fill="none"
      aria-hidden="true"
      className="guitar-decor"
    >
      {/* floor shadow */}
      <ellipse cx="72" cy="308" rx="52" ry="7" fill="rgba(26,21,16,0.14)" />
      {/* strap hanging off the wall (little story detail) */}
      <path d="M120 38c14 10 14 34 4 44" stroke={ink} strokeWidth="1.5" opacity="0.45" />
      {/* neck (leaning) */}
      <path d="M84 22l14 2-22 128-16-3z" fill={woodSoft} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      {/* headstock */}
      <path d="M82 24l-4-20 22-2 0 24z" fill={wood} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="84" cy="8" r="1.8" fill={ink} />
      <circle cx="92" cy="7" r="1.8" fill={ink} />
      <circle cx="86" cy="16" r="1.8" fill={ink} />
      <circle cx="94" cy="15" r="1.8" fill={ink} />
      {/* frets */}
      <path d="M79 45l15 3M77 62l15 3M74 79l15 3M72 96l15 3M70 113l15 3" stroke={ink} strokeWidth="1" opacity="0.5" />
      {/* body */}
      <path
        d="M76 148c-26-4-42 10-44 30-1.5 15-12 20-14 38-3 28 16 52 44 56s52-14 55-42c2-18-7-25-5-40 3-20-10-38-36-42z"
        fill={woodSoft}
        stroke={ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* sound hole + rosette */}
      <circle cx="66" cy="212" r="15" fill="rgba(26,21,16,0.35)" stroke={ink} strokeWidth="1.5" />
      <circle cx="66" cy="212" r="19" stroke={ink} strokeWidth="1" opacity="0.4" />
      {/* bridge */}
      <rect x="42" y="248" width="34" height="8" rx="2.5" transform="rotate(9 59 252)" fill={wood} stroke={ink} strokeWidth="1.4" />
      {/* strings */}
      <path d="M86 20 58 250M89 21 62 251M92 21 66 252" stroke={ink} strokeWidth="0.7" opacity="0.5" />
    </svg>
  )
}

export function DeskLamp() {
  return (
    <svg
      viewBox="0 0 240 190"
      width="228"
      height="180"
      fill="none"
      aria-hidden="true"
      className="lamp-decor"
    >
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#ffcf8f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffcf8f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* light cone spilling onto the desk/terminal */}
      <path className="lamp-light" d="M74 86 L8 190 L166 190 Z" fill="url(#lampGlow)" />
      {/* clamp base (grips the terminal edge) */}
      <path d="M196 148h26M200 148v22m18-22v22m-18 0h18" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      {/* arms */}
      <path d="M209 148 176 74" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M176 74 96 62" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="176" cy="74" r="3.5" fill={ink} />
      <circle cx="209" cy="148" r="3.5" fill={ink} />
      {/* shade — cone pointing down-left */}
      <path d="M104 46l-40 26 22 26c16-6 24-22 18-52z" fill={wood} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
      {/* bulb */}
      <circle className="lamp-bulb" cx="76" cy="82" r="5" fill="#ffcf8f" />
    </svg>
  )
}

export function TinyPlant() {
  return (
    <svg viewBox="0 0 60 62" width="54" height="56" fill="none" aria-hidden="true">
      <path d="M30 40c0-12-8-18-16-20 4 12 8 16 14 20" stroke={leaf} strokeWidth="1.5" />
      <path d="M30 40c0-14 8-20 16-22-3 13-8 18-14 22" stroke={leaf} strokeWidth="1.5" />
      <path d="M30 42V26" stroke={leaf} strokeWidth="1.5" />
      <path d="M18 42h24l-3 16H21z" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
