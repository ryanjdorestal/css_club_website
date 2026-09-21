# Sources

| Source | What was taken | License / terms |
|---|---|---|
| [`jjcss/CSS_Website`](https://github.com/jjcss/CSS_Website) @ `a8fca55` (2025-04-22) | Site copy (home, about, cyberhounds, grad-school article), board roster + bios + photos (Fall 2020 → Spring 2025), events (Spring 2025, Fall 2024) + flyers, 27 resource links, social links, section color trio (#CE4A4A / #40A33F / #1E80F0), Poppins + VT323 type choices, binary-ring header motif, circular stamp lockup | MIT © 2022 Computer Science Society Club at John Jay College — notice kept in `LICENSE` |
| Club YouTube banner (`assets/refs/club/youtube_banner.png`) | Navy palette (#1E4664 family), teal ring glow (#6ED2E6), taglines, Bloodhound mascot reference | Club's own asset |
| John Jay College | Bloodhound mascot, college name/seal | College trademark; used by its recognized student club under college brand rules; not MIT-licensed |
| [jjay.cuny.edu](https://www.jjay.cuny.edu/themes/custom/jj_custom/resources/logos/JJ_Logo_white.svg) | Official John Jay wordmark (`assets/brand/jj_logo_white.svg`, embedded 162×117 raster; upscaled ×4 for the site footer) — fetched 2026-09-20 | College trademark, same terms as above; the board should request a vector master |
| `assets/cube/cs_cube.glb`, `assets/brand/cs_logo_sharp.svg` | Identity object (procedural rebuild of the club logo; see `assets/cube/build_cube.py`) | Built for the club in the planning session |
| `~/Desktop/LAGCC/rhec_web/rhecwb` (Ryan's LaGuardia platform) | Structure only: endpoint contracts, SQL shapes, OS route list, Tier-1 patterns. Nothing copied verbatim. | Reference |
| `assets/brand/jj_bloodhound.webp` — the official John Jay College Bloodhound mascot (1472×1332, TM), supplied by Ryan 2026-09-20 | Footer mascot (`apps/web/public/img/jj_bloodhound.webp`, alpha via `scripts/hound_alpha.py`) | **John Jay College's mark, not the club's** — board-owned in the handoff; keep the TM, no recolouring, no glaze. Replace with the college's vector master if they supply one. |
| `assets/refs/hound/cyberhound_logo_red_outline.png` + pitbull photo refs (Ryan, 2026-09-20) | Colour/attitude + anatomy references for the procedural 3D Cyberhound (`assets/hound3d/build_hound.py`) — nothing copied, nothing traced | reference only; the GLB is original |

Extraction is by script (`scripts/extract_old_site.py`) from a git-ignored clone in
`.cache/CSS_Website/`; the old repo is never vendored.
