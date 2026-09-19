# 10 — Tooling: Claude Code (MCP servers are OPTIONAL and skipped by default)

> **Ryan (T18): "fuck the mcp shit that's just too much."** The build runs in Claude Code
> with plain libraries; no MCP is required. `mcp.template.json` was moved to
> `context/optional/` for anyone who wants it later. Everything below the first section is
> reference only.

## What the build actually uses
- Claude Code in `~/Desktop/jjay_css`, reading `CLAUDE.md` → `context/15_EXECUTION_PLAN.md`.
- npm/pip installs directly. Components written by hand to match `assets/refs/jj_inspo/`
  and `DESIGN.md` — no component registries.
- Visual check: Vite dev server + Playwright (npm package, not the MCP) for screenshots
  at 1440/1024/768/390 into `qa/shots/` (same idea as rhecwb's `os:shots`).
- Laptop resources it may read: see `16_RESOURCES_ON_LAPTOP.md`.

---


## (reference) The split (why two tools)

- **Cowork (this chat):** everything structural — analysis, specs, tokens, DESIGN.md,
  brand-config extraction from rhecwb, content migration script, the cube asset, CI.
  It has a shell on the Mac inside connected folders and can run any CLI (`npx shadcn
  add …`), but its preview loop is "build → screenshot in the cloud → send PNG": a dev
  server started from Cowork runs inside a sandboxed VM and the built-in browser can't
  reach that localhost.
- **Claude Code (terminal, this folder):** the visual polish loop — `npm run dev`,
  open `localhost:5173` in your own browser, nudge, refresh. Plus MCP-backed component
  fetching.

The shadcn MCP and 21st.dev Magic are **local stdio MCP servers** — not in the Claude
connector registry (checked: Figma, v0, Canva, Webflow, Magic Patterns are; shadcn and
21st are not). They run on the machine, so Claude Code is where they live.
`.mcp.json` at the repo root is project-scoped; Claude Code asks once to approve it.

## `.mcp.json` (already in the folder)

```json
{
  "mcpServers": {
    "shadcn":     { "command": "npx", "args": ["shadcn@latest", "mcp"] },
    "magic":      { "command": "npx", "args": ["-y", "@21st-dev/magic@latest"],
                    "env": { "API_KEY": "${TWENTYFIRST_API_KEY}" } },
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "context7":   { "command": "npx", "args": ["-y", "@upstash/context7-mcp@latest"] }
  }
}
```

What each is for:
- **shadcn** — the official shadcn/ui MCP: browse/add registry components (and Magic UI /
  Aceternity registries, which are shadcn-compatible) instead of hallucinating them.
- **magic (21st.dev)** — generates/fetches polished components (marquees, bento grids,
  number tickers, spotlight cards, grid backgrounds) into the project. Free tier exists.
  Needs an API key from 21st.dev — **you create it and set it; never paste it into chat.**
- **playwright** — lets Claude Code open the dev server, screenshot pages, click through
  flows. This is the visual-loop tool.
- **context7** — pulls current docs for R3F / drei / Motion / Tailwind v4 so generated
  code matches the installed versions.

## Commands (run in the repo root; verify against each tool's README if one errors)

Set the 21st.dev key once in your shell profile (not in the repo):
```bash
export TWENTYFIRST_API_KEY="..."          # from https://21st.dev (Magic → API key)
```

Option A — the project file is already there; just open Claude Code in the folder and
approve the servers when prompted:
```bash
cd ~/Desktop/jjay_css
claude
# → "This project has MCP servers configured in .mcp.json. Approve?" → yes
/mcp                                       # check status of all four
```

Option B — register them yourself (user- or project-scope) with the CLI:
```bash
claude mcp add shadcn     -- npx shadcn@latest mcp
claude mcp add magic      -e API_KEY="$TWENTYFIRST_API_KEY" -- npx -y @21st-dev/magic@latest
claude mcp add playwright -- npx -y @playwright/mcp@latest
claude mcp add context7   -- npx -y @upstash/context7-mcp@latest
claude mcp list
```
(`-s project` writes to `.mcp.json`; `-s user` makes them available in every project.)

shadcn also has its own initializer that writes the config for Claude:
```bash
npx shadcn@latest mcp init --client claude
```

Optional remote connectors (if wanted later):
```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

## Libraries to install when building starts (not yet)

```
react react-dom typescript vite @vitejs/plugin-react
tailwindcss @tailwindcss/vite
three @react-three/fiber @react-three/drei @react-three/postprocessing
motion
react-router
lucide-react            (or @phosphor-icons/react)
shadcn (CLI)            → components on demand
```
Fonts via Google Fonts `<link>` (Archivo / Instrument Sans / Geist Mono); no packages.

## The rule that matters more than any tool

`tokens.css` + `DESIGN.md` exist **before** the first component is generated. Every tool
above reads them. That's the difference between "generate a hero" and "generate *our*
hero." See 05.

## Also useful in Claude Code

- `CLAUDE.md` at root is auto-read; it points here.
- Keep `.claude/settings.local.json` allowlists narrow (rhecwb's is a good model:
  `Bash(npm run *)`, specific curl/kill lines).
- `/init` is unnecessary — `CLAUDE.md` already exists.
