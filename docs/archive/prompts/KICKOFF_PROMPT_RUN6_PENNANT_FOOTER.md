# 30 — RUN 6: CYBERHOUNDS PENNANT · FOOTER (clean hound, map, no wordmark) — ≤45 min, no questions

Paste into Claude Code (Fable, xhigh) in `~/Desktop/jjay_css`. Write only inside this folder; never push.

---

## 0. Ryan's review (verbatim → do)

"Cyberhounds section is good except the flag with the pitbull on it — the original image wasn't shaped like
that, so there are rough crop/photoshop traces. Make it a rectangular shape (or a shape with a pointy
bottom), black background, and put the black-and-red hound on it so it blends seamlessly and actually looks
like a flag. Footer: you finally got the dog on, but I can see the crop traces — blend them out. Remove
`CSS · JOHN JAY` (redundant), and use the space on the left for a map linked to John Jay's Google Maps
address, the way John Jay's own site footer does it."

Everything else stays. No new fonts, no `api/` changes, no API keys.

## 1. New assets (already in `assets/brand/`, made by Cowork — use them, do not regenerate)

- `cyberhound_head.svg` — the Cyberhounds pitbull head, **vector-traced** from the old site's original
  header art (`.cache/CSS_Website/files/images/cyberhounds-header.png`), single path, fill `#B3202A`,
  viewBox `0 0 1709 2270`. Clean edges at any size.
- `cyberhounds_pennant.svg` — a finished **pennant**: 600×780 viewBox, black `#0A0A0C` field, straight
  sides to y=600 then a point at (300,780), a 2px red inset hairline following the shape, the head centered,
  `CYBERHOUNDS` in mono under it. Preview verified on paper: no traces, no crop artifacts.
- `jj_bloodhound_alpha.png` (1472×1332, 1.0 MB, lossless) and `jj_bloodhound_alpha.webp` (160 KB) — the
  official Bloodhound with a **proper alpha matte** (fixed-range flood fill, 5px anti-alias band with
  luminance-derived alpha, color decontamination). Verified composited on `#0C183C` at 100 % zoom: no white
  fringe, no jaggies. The previous `public/img/jj_bloodhound.webp` had a hard-thresholded edge — that was the
  "trace". Replace it.

## 2. Cyberhounds pennant (`/cyberhounds` §1 "What is CTF")

Replace the `PhotoFrame src="/img/photos/cyberhounds-header.webp"` with a `Pennant` component:
- `apps/web/src/components/Pennant.tsx`: renders `cyberhounds_pennant.svg` inline (import as React component
  via `?react` / vite-plugin-svgr, or copy the SVG markup into TSX so the red uses `var(--color-red)` and
  the field uses `#0A0A0C`). Width fills the frame column (max 520 px), height auto.
- Keep the run-3 frame furniture around it: `Brackets`, `VISUAL · 01` / `FRAME · 001` rail, caption
  `CYBERHOUNDS · PENNANT · VECTOR` (replace "HEADER ART · ORIGINAL"). Corners of the *frame* stay square;
  the pennant's point extends below the frame's bottom hairline by 24 px (it hangs), so the frame's bottom
  rule is drawn behind the pennant.
- Motion: on reveal the pennant drops 24 px into place (0.6 s) and the head's red path draws its outline in
  (`stroke-dasharray` trick on a 1px stroke copy, 0.9 s) before the fill fades in (0.3 s). Hover: a 1.5°
  sway around the top edge (`transform-origin: 50% 0`), 1.2 s ease.
- Delete `public/img/photos/cyberhounds-header.webp` and its `content/images` entry; update the parity row
  ("Cyberhounds header art → vector pennant").
- Also use `cyberhound_head.svg` (not the pixel hound) as the `PosterCard` corner mark on this page at 40 px,
  and as the 404's secondary mark if any hound is used there.

## 3. Footer

1. **Hound:** replace `public/img/jj_bloodhound.webp` with `assets/brand/jj_bloodhound_alpha.webp` (copy;
   keep the `.png` in assets as master). Same placement as run 5 (right-anchored, ~62 vh, cropped ~10 %
   below the bottom, bleeding 6 % off the right). Remove the left-third navy gradient overlay entirely — the
   matte is clean now and the gradient was reading as a "trace". Keep the slide-up entrance.
2. **Remove** the `CSS · JOHN JAY` wordmark from the bottom rail (and the `.t-brand` class if nothing else
   uses it). The rail keeps copyright · `HANDED_TO_THE_BOARD` · version · `BACK_TO_TOP` in mono.
3. **Map (left side of the hound zone)** — model it on John Jay's own footer
   (`https://www.jjay.cuny.edu`, bottom: logo + tagline, a wide map tile, address/phone block):
   - A `MapCard` component: a Google Maps **embed iframe** (keyless — `https://www.google.com/maps?q=524+W+59th+St,+New+York,+NY+10019&z=16&output=embed`), `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, `title="John Jay College on Google Maps"`, inside `Brackets` with a mono rail `//LOCATION · 40.7706° N / 73.9886° W`. Size: 560×300 at 1440 (fills the left ~55 % of the hound zone, vertically centered against the hound), 100 % wide × 220 on mobile, above the hound.
   - Dark treatment so it doesn't blow a white hole in the footer: wrap the iframe in a div with `filter: invert(0.92) hue-rotate(185deg) saturate(0.6) contrast(0.9)` and a 1px `--line` border; on hover the filter eases to `invert(0)` over 0.4 s (the map "lights up") — that reads as intentional, not as a broken embed.
   - The whole card is a link: an absolutely-positioned `<a href="https://maps.google.com/?q=524+W+59th+St,+New+York,+NY+10019" target="_blank" rel="noopener">` overlay with `OPEN_IN_MAPS ↗` as a Bracket CTA in its bottom-right; the iframe itself gets `pointer-events: none` so scroll isn't hijacked.
   - Under the card: address block in the JJ-site pattern, mono/body: `524 West 59th Street` / `New York, NY 10019` / `Main 212.237.8000` / `computersocjjay@gmail.com` — from `brand.config` (add the address/phone fields there; source: jjay.cuny.edu footer).
   - Tier 1 / offline: if the iframe fails to load in 4 s or `navigator.onLine` is false, show a static fallback: a `DotGrid` panel with a `Crosshair` sigil at the coordinates and the same `OPEN_IN_MAPS ↗` link. Never a broken grey box.
   - Privacy note in `SOURCES.md`: the embed loads from google.com only when the footer scrolls into view (lazy); no keys, no tracking params.
4. Layout of the hound zone at 1440: left column (map card + address, ~640 px) · right: the hound bleeding
   off the edge. At 1024–1280 the map shrinks to 460 px; below 1024 the map stacks above the hound (hound
   42 vh). Nothing overlaps the hound's face at any width — check 1024, 1280, 1440, 1920.

## 4. Verify

Shoot `/cyberhounds` §1 at 1440 (pennant), the footer bottom at 1024/1280/1440/1920 and 390, and a
100 %-zoom crop of the hound's left edge on navy. Read them. Gate: no visible matte fringe at 100 %, pennant
edges crisp, map loads dark and lights up on hover (shoot hover state), address block present,
no `CSS · JOHN JAY` anywhere. Commit `feat(ui): vector pennant, clean hound matte, footer map`. Update
`qa/REPORT_RUN6.md` with the shots and `context/31_RUN6_LOG.md`. Print the two dev commands.
