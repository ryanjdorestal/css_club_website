import { brand } from "@brand/brand.config";

/** The circular stamp lockup (footer mark; jj_01 old header). Cube center,
    college name on the top arc, club name on the bottom arc. */
export function StampLockup({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${brand.college} — ${brand.name} stamp`}>
      <defs>
        <path id="stamp-top" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0" />
        <path id="stamp-bottom" d="M 60,60 m -44,0 a 44,44 0 1,0 88,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <text
        fill="currentColor"
        style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 2.2, fontWeight: 600 }}
      >
        <textPath href="#stamp-top" startOffset="50%" textAnchor="middle">
          JOHN JAY COLLEGE
        </textPath>
      </text>
      <text
        fill="currentColor"
        style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.6, fontWeight: 600 }}
      >
        <textPath href="#stamp-bottom" startOffset="50%" textAnchor="middle">
          COMPUTER SCIENCE SOCIETY
        </textPath>
      </text>
      <circle cx="14" cy="60" r="2" fill="currentColor" />
      <circle cx="106" cy="60" r="2" fill="currentColor" />
      <image href={brand.logos.svg} x="36" y="36" width="48" height="48" />
    </svg>
  );
}
