/**
 * The John Jay Bloodhound — the chatbot mascot, traced by eye from the club's
 * YouTube banner (assets/refs/club/youtube_banner.png): light fur, navy line
 * work, the slouched navy knit beanie, long scalloped ears, heavy jowls.
 * Flat vector; emotes swap eye/brow/ear/mouth groups; CSS animates blink/z's.
 * Respectful simplification of the college's mark for a recognized club.
 */
export type Emote = "idle" | "thinking" | "happy" | "confused" | "sleeping" | "alert";

const FUR = "#E9EEF5";
const FUR_SHADE = "#C7D2DF";
const LINE = "#12294A";
const BEANIE = "#1E4664";
const BEANIE_DARK = "#12294A";
const TEAL = "#6ED2E6";

export function Bloodhound({
  emote = "idle",
  size = 128,
  className = "",
}: {
  emote?: Emote;
  size?: number;
  className?: string;
}) {
  const earTilt =
    emote === "alert" ? -14 : emote === "thinking" ? -7 : emote === "happy" ? -5 : 0;
  const earTiltR =
    emote === "alert" ? 14 : emote === "confused" ? 9 : emote === "happy" ? 5 : 0;
  const headTilt = emote === "confused" ? 5 : 0;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Hound mascot — ${emote}`}
    >
      <style>{`
        .bh-eye { transform-origin: center; transform-box: fill-box; }
        .bh-blink .bh-eye { animation: bh-blink 6s infinite; }
        @keyframes bh-blink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
        .bh-z { font-family: var(--font-pixel, monospace); fill: ${TEAL}; opacity: 0; }
        .bh-z1 { animation: bh-z 2.8s infinite 0s; }
        .bh-z2 { animation: bh-z 2.8s infinite 0.7s; }
        .bh-z3 { animation: bh-z 2.8s infinite 1.4s; }
        @keyframes bh-z { 0% { opacity: 0; transform: translate(0,0); } 25% { opacity: 1; } 80% { opacity: 0; transform: translate(7px,-13px); } 100% { opacity: 0; } }
        .bh-ring { transform-origin: 60px 62px; animation: bh-ring 2s ease-out infinite; }
        @keyframes bh-ring { 0% { transform: scale(0.92); opacity: 0.8; } 100% { transform: scale(1.15); opacity: 0; } }
        .bh-dot { fill: ${TEAL}; opacity: 0; }
        .bh-d1 { animation: bh-dot 1.6s infinite 0s; }
        .bh-d2 { animation: bh-dot 1.6s infinite 0.25s; }
        .bh-d3 { animation: bh-dot 1.6s infinite 0.5s; }
        @keyframes bh-dot { 0%, 100% { opacity: 0.15; } 40% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .bh-blink .bh-eye, .bh-z, .bh-ring, .bh-dot { animation: none !important; }
          .bh-z2, .bh-dot { opacity: 0.9; }
        }
      `}</style>

      {emote === "alert" && (
        <circle className="bh-ring" cx="60" cy="62" r="52" fill="none" stroke={TEAL} strokeWidth="2.5" />
      )}

      <g transform={`rotate(${headTilt} 60 66)`} className={emote === "idle" ? "bh-blink" : undefined}>
        {/* ears — long scalloped flaps hanging beside the face */}
        <g transform={`rotate(${earTilt} 27 42)`}>
          <path
            d="M28 40 C 16 46, 12 62, 14 78 C 15 90, 22 96, 28 92 C 34 88, 34 76, 33 64 C 32.5 55, 32 46, 33 41 Z"
            fill={FUR_SHADE} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round"
          />
          <path d="M20 58 q 4 3 8 1 M18 70 q 4 3 8 1" fill="none" stroke={LINE} strokeWidth="1.4" opacity="0.5" />
        </g>
        <g transform={`rotate(${-earTiltR} 93 42)`}>
          <path
            d="M92 40 C 104 46, 108 62, 106 78 C 105 90, 98 96, 92 92 C 86 88, 86 76, 87 64 C 87.5 55, 88 46, 87 41 Z"
            fill={FUR_SHADE} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round"
          />
          <path d="M100 58 q -4 3 -8 1 M102 70 q -4 3 -8 1" fill="none" stroke={LINE} strokeWidth="1.4" opacity="0.5" />
        </g>

        {/* head — wide, cheeks bulging, chin at the jowls */}
        <path
          d="M32 44 C 28 52, 28 62, 32 72 C 36 84, 46 92, 60 92 C 74 92, 84 84, 88 72 C 92 62, 92 52, 88 44 C 82 38, 72 36, 60 36 C 48 36, 38 38, 32 44 Z"
          fill={FUR} stroke={LINE} strokeWidth="2.5"
        />
        {/* teal rim light — the banner's ring glow */}
        <path d="M31.5 48 C 29.5 56, 29.5 64, 32.5 72" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.7" strokeLinecap="round" />

        {/* beanie — slouched knit cap with band, tilted like the banner */}
        <g transform="rotate(-4 60 26)">
          <path
            d="M34 38 C 32 22, 44 12, 60 12 C 74 12, 86 20, 87 32 C 88 38, 87 40, 86 41 L 34 41 Z"
            fill={BEANIE} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round"
          />
          {/* slouch fold hanging right */}
          <path d="M84 20 C 92 18, 97 24, 94 31 C 92 36, 87 37, 85 35 Z" fill={BEANIE} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
          {/* knit crosshatch */}
          <path d="M42 16 L 38 38 M52 13 L 50 39 M62 12 L 62 39 M72 14 L 74 39 M80 18 L 82 39" stroke={LINE} strokeWidth="1.2" opacity="0.35" fill="none" />
          <path d="M36 24 C 50 20, 70 20, 86 26 M35 31 C 50 27, 70 27, 87 32" stroke={LINE} strokeWidth="1.2" opacity="0.35" fill="none" />
          {/* band */}
          <rect x="33" y="38" width="55" height="7" rx="3.5" fill={BEANIE_DARK} stroke={LINE} strokeWidth="2" />
        </g>

        {/* brows */}
        {emote === "confused" ? (
          <g stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M42 50 L 52 53" />
            <path d="M68 51 L 78 47" />
          </g>
        ) : emote === "alert" ? (
          <g stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M42 48 Q 47 45 52 47" />
            <path d="M68 47 Q 73 45 78 48" />
          </g>
        ) : (
          <g stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M42 51 Q 47 48 52 50" />
            <path d="M68 50 Q 73 48 78 51" />
          </g>
        )}

        {/* eyes */}
        {emote === "sleeping" ? (
          <g stroke={LINE} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M43 58 Q 47 61 51 58" />
            <path d="M69 58 Q 73 61 77 58" />
          </g>
        ) : emote === "happy" ? (
          <g stroke={LINE} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M43 58 Q 47 54 51 58" />
            <path d="M69 58 Q 73 54 77 58" />
          </g>
        ) : emote === "thinking" ? (
          <g>
            <circle className="bh-eye" cx="46" cy="56" r="3.4" fill={LINE} />
            <circle className="bh-eye" cx="72" cy="56" r="3.4" fill={LINE} />
            <circle cx="47" cy="55" r="1" fill={TEAL} />
            <circle cx="73" cy="55" r="1" fill={TEAL} />
          </g>
        ) : emote === "alert" ? (
          <g>
            <circle cx="47" cy="57" r="5.2" fill="#FFFFFF" stroke={LINE} strokeWidth="1.5" />
            <circle cx="73" cy="57" r="5.2" fill="#FFFFFF" stroke={LINE} strokeWidth="1.5" />
            <circle cx="47" cy="57" r="2.8" fill={LINE} />
            <circle cx="73" cy="57" r="2.8" fill={LINE} />
          </g>
        ) : (
          <g>
            <circle className="bh-eye" cx="47" cy="58" r="3.4" fill={LINE} />
            <circle className="bh-eye" cx="73" cy="58" r="3.4" fill={LINE} />
            <circle cx="48.2" cy="56.8" r="1" fill={TEAL} />
            <circle cx="74.2" cy="56.8" r="1" fill={TEAL} />
          </g>
        )}

        {/* muzzle: jowl lobes + nose + mouth */}
        <path
          d="M45 66 C 41 74, 43 84, 50 86 C 55 87.5, 58 84, 58 79 L 58 70 Z"
          fill="#F4F7FB" stroke={LINE} strokeWidth="2.2" strokeLinejoin="round"
        />
        <path
          d="M75 66 C 79 74, 77 84, 70 86 C 65 87.5, 62 84, 62 79 L 62 70 Z"
          fill="#F4F7FB" stroke={LINE} strokeWidth="2.2" strokeLinejoin="round"
        />
        <path
          d="M52 62 C 52 58, 68 58, 68 62 C 68 67, 64 70, 60 70 C 56 70, 52 67, 52 62 Z"
          fill={BEANIE_DARK} stroke={LINE} strokeWidth="2"
        />
        <path d="M56 63.5 q 1.5 1.5 3 0 M61 63.5 q 1.5 1.5 3 0" stroke="#0C183C" strokeWidth="1.4" fill="none" opacity="0.8" />

        {/* mouth per emote */}
        {emote === "happy" ? (
          <path d="M54 84 Q 60 90 66 84" fill="none" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
        ) : emote === "confused" ? (
          <path d="M55 85 q 2.5 -2 5 0 q 2.5 2 5 -2" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M60 70 L 60 83" fill="none" stroke={LINE} strokeWidth="1.8" opacity="0.6" />
        )}
      </g>

      {emote === "sleeping" && (
        <g>
          <text className="bh-z bh-z1" x="88" y="34" fontSize="16">z</text>
          <text className="bh-z bh-z2" x="96" y="26" fontSize="20">z</text>
          <text className="bh-z bh-z3" x="105" y="18" fontSize="24">z</text>
        </g>
      )}
      {emote === "thinking" && (
        <g>
          <circle className="bh-dot bh-d1" cx="92" cy="30" r="2.2" />
          <circle className="bh-dot bh-d2" cx="99" cy="24" r="2.8" />
          <circle className="bh-dot bh-d3" cx="107" cy="17" r="3.4" />
        </g>
      )}
    </svg>
  );
}
