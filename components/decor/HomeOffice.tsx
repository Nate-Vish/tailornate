/* Decorative home-office illustrations — line-art SVG, aria-hidden.
   Colors ride on CSS vars so they adapt to light/dark themes. */

const ink = "var(--fg)"
const wood = "rgba(139,104,71,0.30)"
const woodSoft = "rgba(139,104,71,0.18)"
const clay = "rgba(178,102,66,0.32)"
const clayDeep = "rgba(150,82,50,0.45)"
const leaf = "#4e8b5f"
const leafLight = "#6da87a"
const shadow = "rgba(26,21,16,0.16)"

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
      {/* ---- trailing pothos, left ---- */}
      {/* vine over the pot */}
      <path d="M40 64 C36 52 44 44 54 46" stroke={leaf} strokeWidth="1.4" />
      <path d="M40 64 C44 54 34 48 28 52" stroke={leaf} strokeWidth="1.4" />
      {/* heart-shaped leaves with veins */}
      <path d="M54 46c5-6 13-3 12 3 -1 6-8 8-13 3 -1-2-1-4 1-6z" fill="rgba(78,139,95,0.18)" stroke={leaf} strokeWidth="1.4" />
      <path d="M55 49c3 0 6 0 9-1" stroke={leafLight} strokeWidth="0.9" />
      <path d="M28 52c-6-4-13 1-11 6 2 6 9 6 13 1 1-2 0-5-2-7z" fill="rgba(78,139,95,0.18)" stroke={leaf} strokeWidth="1.4" />
      <path d="M28 55c-3 0-6 1-8 2" stroke={leafLight} strokeWidth="0.9" />
      <path d="M44 40c2-7 10-7 12-2 2 6-4 10-10 7 -2-1-3-3-2-5z" fill="rgba(78,139,95,0.18)" stroke={leaf} strokeWidth="1.4" />
      {/* terracotta pot with rim */}
      <path d="M30 64h24l-3.5 18h-17z" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="28" y="61" width="28" height="5" rx="2" fill={clayDeep} stroke={ink} strokeWidth="1.5" />
      {/* vine trailing below the shelf, natural cascade */}
      <path d="M34 93 C28 104 40 112 34 124 C30 132 36 138 33 144" stroke={leaf} strokeWidth="1.3" />
      <path d="M34 104c-5-4-11 0-9 5 1 4 7 4 9 0 1-2 1-4 0-5z" fill="rgba(78,139,95,0.15)" stroke={leaf} strokeWidth="1.2" />
      <path d="M36 122c5-3 10 1 8 5 -2 4-8 3-9-1 0-2 0-3 1-4z" fill="rgba(78,139,95,0.15)" stroke={leaf} strokeWidth="1.2" />
      <path d="M33 138c-5-2-9 2-7 6 2 3 7 2 8-1 0-2 0-4-1-5z" fill="rgba(78,139,95,0.15)" stroke={leaf} strokeWidth="1.2" />

      {/* contact shadows on the plank */}
      <ellipse cx="42" cy="84" rx="14" ry="1.6" fill={shadow} />
      <ellipse cx="103" cy="84" rx="22" ry="1.6" fill={shadow} />
      <ellipse cx="166" cy="84" rx="14" ry="1.6" fill={shadow} />
      <ellipse cx="208" cy="84" rx="12" ry="1.6" fill={shadow} />

      {/* ---- books, middle ---- */}
      {/* upright */}
      <path d="M84 54h10v30H84z" fill={wood} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M87 58v22" stroke={ink} strokeWidth="0.8" opacity="0.4" />
      <path d="M96 50h11v34H96z" fill="none" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M99 54h5M99 58h5" stroke={ink} strokeWidth="0.8" opacity="0.45" />
      <path d="M109 57h8v27h-8z" fill={woodSoft} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      {/* two lying flat */}
      <path d="M120 79h22v5h-22z" fill={woodSoft} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M122 74h19v5h-19z" fill={wood} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
      {/* leaning against the stack */}
      <path d="M143 84l11-30 7 2.5-11 30z" fill="none" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M148 78l8-22" stroke={ink} strokeWidth="0.8" opacity="0.4" />

      {/* ---- snake plant ---- */}
      <path d="M160 62 C157 48 159 38 163 30 C165 40 165 52 164 62z" fill="rgba(78,139,95,0.2)" stroke={leaf} strokeWidth="1.3" />
      <path d="M162 55c0-8 1-15 1-20" stroke={leafLight} strokeWidth="0.9" />
      <path d="M166 62 C167 50 171 40 176 34 C175 44 172 54 170 62z" fill="rgba(78,139,95,0.2)" stroke={leaf} strokeWidth="1.3" />
      <path d="M169 56c2-7 4-13 6-18" stroke={leafLight} strokeWidth="0.9" />
      <path d="M156 62 C152 54 150 46 151 39 C155 46 157 54 158 62z" fill="rgba(78,139,95,0.2)" stroke={leaf} strokeWidth="1.3" />
      <path d="M172 62 C175 54 179 49 183 46 C181 52 177 58 175 62z" fill="rgba(78,139,95,0.2)" stroke={leaf} strokeWidth="1.3" />
      {/* pot */}
      <path d="M152 66h28l-3.5 18h-21z" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="150" y="62" width="32" height="5.5" rx="2" fill={clayDeep} stroke={ink} strokeWidth="1.5" />

      {/* ---- coffee mug ---- */}
      <path className="steam" d="M203 50c3-4-2-7 1-12" stroke={ink} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />
      <path className="steam steam-2" d="M211 50c3-4-2-7 1-12" stroke={ink} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />
      {/* body with elliptical rim */}
      <path d="M198 59c0 14 2 22 4 24 1.5 1.5 8.5 1.5 10 0 2-2 4-10 4-24" fill={clay} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="207" cy="59" rx="9" ry="3" fill={clayDeep} stroke={ink} strokeWidth="1.4" />
      {/* handle */}
      <path d="M216 63c6-1 7 9 0 11" stroke={ink} strokeWidth="1.5" fill="none" />

      {/* ---- plank with grain + brackets ---- */}
      <rect x="4" y="85" width="232" height="7.5" rx="2" fill={wood} stroke={ink} strokeWidth="1.5" />
      <path d="M18 88.5h40M70 90h58M140 88h46M196 90h30" stroke={ink} strokeWidth="0.7" opacity="0.3" />
      <path d="M28 93v10M28 93h10M28 103l10-10M212 93v10M212 93h-10M212 103l-10-10" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <ellipse cx="70" cy="308" rx="54" ry="7" fill="rgba(26,21,16,0.14)" />
      {/* wall hook + strap, story detail */}
      <circle cx="126" cy="34" r="2.2" fill={ink} opacity="0.5" />
      <path d="M126 36c10 12 8 30-2 42" stroke={ink} strokeWidth="1.4" opacity="0.4" />
      <path d="M126 36c4 14 2 28-6 40" stroke={ink} strokeWidth="1.4" opacity="0.3" />

      {/* ---- headstock ---- */}
      <path d="M79 24 L76 6 C76 3 78 2 81 2 L95 3 C98 3 99 5 99 8 L97 26 z" fill={wood} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      {/* tuner buttons, 3 a side */}
      <circle cx="73" cy="8" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="72" cy="15" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="71" cy="22" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="101" cy="9" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="102" cy="16" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="103" cy="23" r="2.4" fill="none" stroke={ink} strokeWidth="1.2" />
      {/* string posts */}
      <circle cx="81" cy="9" r="1.2" fill={ink} />
      <circle cx="80" cy="16" r="1.2" fill={ink} />
      <circle cx="79" cy="22" r="1.2" fill={ink} />
      <circle cx="93" cy="10" r="1.2" fill={ink} />
      <circle cx="94" cy="17" r="1.2" fill={ink} />
      <circle cx="95" cy="23" r="1.2" fill={ink} />
      {/* nut */}
      <path d="M78.5 27.5l19 1.5" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />

      {/* ---- neck, tapered and leaning ---- */}
      <path d="M78.5 28 L97.5 29.5 L88 150 L70 147 z" fill={woodSoft} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      {/* frets, perpendicular to the neck */}
      <path d="M77 47l19 2M75.5 66l19 2M74 85l18.5 2M72.5 104l18 2M71 123l17.5 2M70 140l17 2" stroke={ink} strokeWidth="0.9" opacity="0.5" />
      {/* position dots */}
      <circle cx="84" cy="76" r="1.4" fill={ink} opacity="0.5" />
      <circle cx="82" cy="114" r="1.4" fill={ink} opacity="0.5" />

      {/* ---- body: figure-8, slight lean ---- */}
      {/* side (thickness) hint behind */}
      <path
        d="M70 152 C44 148 28 162 26 182 C24.5 197 14 202 12 220 C9 248 28 272 56 276 C84 280 108 262 111 234 C113 216 104 209 106 194 C109 174 96 156 70 152 z"
        fill="rgba(26,21,16,0.18)"
        transform="translate(-4 3)"
      />
      {/* top */}
      <path
        d="M70 152 C44 148 28 162 26 182 C24.5 197 14 202 12 220 C9 248 28 272 56 276 C84 280 108 262 111 234 C113 216 104 209 106 194 C109 174 96 156 70 152 z"
        fill={woodSoft}
        stroke={ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* binding, inner outline following the top */}
      <path
        d="M69.5 156.5 C46 153 32.5 165 30.5 183 C29 197 19 202.5 17 219.5 C14.5 245 32 267 57 270.5 C82 274 103 258 105.7 233 C107.5 217 99 210 101 195.5 C103.7 177.5 93 160 69.5 156.5 z"
        stroke={ink}
        strokeWidth="0.8"
        opacity="0.35"
      />
      {/* sound hole with rosette rings */}
      <circle cx="64" cy="210" r="14.5" fill="rgba(26,21,16,0.38)" stroke={ink} strokeWidth="1.5" />
      <circle cx="64" cy="210" r="17.5" stroke={ink} strokeWidth="0.9" opacity="0.5" />
      <circle cx="64" cy="210" r="20" stroke={ink} strokeWidth="0.6" opacity="0.3" />
      {/* bridge with saddle + pins */}
      <g transform="rotate(9 57 251)">
        <rect x="38" y="246" width="38" height="9" rx="3" fill={wood} stroke={ink} strokeWidth="1.4" />
        <path d="M42 249h30" stroke={ink} strokeWidth="1" opacity="0.55" />
        <circle cx="44" cy="252.5" r="1" fill={ink} />
        <circle cx="50" cy="252.5" r="1" fill={ink} />
        <circle cx="56" cy="252.5" r="1" fill={ink} />
        <circle cx="62" cy="252.5" r="1" fill={ink} />
        <circle cx="68" cy="252.5" r="1" fill={ink} />
        <circle cx="73" cy="252.5" r="1" fill={ink} />
      </g>
      {/* strings: six, nut to bridge */}
      <path d="M79 28 L47 250M82.5 28.3 L52 250.7M85.5 28.6 L57 251.3M88.5 28.9 L62 252M91.5 29.2 L67 252.6M94.5 29.5 L72 253.2" stroke={ink} strokeWidth="0.55" opacity="0.5" />
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
