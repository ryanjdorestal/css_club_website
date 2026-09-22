# qa-scripts

The gates the site is held to, and the tools that produce the evidence for them. Every one opens its
browser through `browser.mjs`, so `CHROME_PATH` points the whole suite at one Chromium.

## Gates — these fail a build

| script | run by | what it asserts |
|---|---|---|
| `axe.mjs` | `make a11y` | WCAG 2 AA on every public route and every OS route as admin. Refuses to grade a login screen standing in for an OS page. |
| `os_gate.mjs` | `make smoke` | The board can reach the OS at all: redirects, reason chips, the nav button, the mobile overlay. |
| `route_validator.mjs` | `make check` | Every route in the router renders and every internal link resolves. |
| `broken_image_scan.mjs` | `make check` | No `<img>` 404s, and every image carries width, height and lazy loading. |
| `tokens_gate.mjs` | `make check` | No literal hex or club names in components — tokens only. |
| `smoke.mjs` | CI | The pages render at all after a build. |
| `font_audit.mjs` | release checks | The type v5 faces are the ones actually shipped and loaded. |

pa11y runs beside `axe.mjs` from `../../.pa11yci.js`; `scripts/a11y.sh` starts what both need and
explains why they use different servers.

## Tools — run by hand, nothing depends on them

`shoot.mjs`, `shoot_os.mjs`, `shots-pages.mjs` (screenshots for a report), `compare.mjs` (diff two
shots), `bento_overlay.mjs` and `login_overlay.mjs` (grid overlays used while matching a reference),
`hound_render.mjs` (renders the 3D Cyberhound to a still).

Run-specific one-offs from earlier builds were deleted in run 12; `git log` has them if a future
run needs one back.
