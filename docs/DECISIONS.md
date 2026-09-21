# DECISIONS.md — the choices a newcomer will question (and why they stand)

**Python API, not Node.** The club teaches Python; a sophomore can read
`api/_core` in an evening. FastAPI + pydantic give validation and typed models
for free, and `scripts/gen_types.py` turns those models into the TypeScript
types, so there is one source of truth.

**Exactly one Vercel function.** The previous platform's deploys failed the
function-count cap and production sat on a stale build for months. `api/` holds
`index.py` + `_core/` and CI fails on anything else. Nothing to remember.

**Tier 1 — everything works with zero accounts.** Boards turn over; keys get
lost; free tiers pause. The site reads committed JSON when Supabase is absent,
the OS writes to local tables + a replayable inbox, and nothing is ever dropped.
Whoever inherits this can run it on a laptop in ten minutes.

**No API keys for features, no LLMs.** Keys expire, bills arrive, and a club
cannot own a vendor relationship across graduations. The chatbot is a static
keyword KB built from the site's own content; Discord is tracked by CSV, not a
bot; maps are a keyless embed.

**Roster-gated login.** An email can sign in only if it is an active row on
`board_profiles` for the current term. Removing an officer is one toggle; a
lost session cannot outlive the term. Sign-in is a one-time email code — no
passwords to reset, no OAuth apps to register.

**Every OS write is audited.** Who, action, table, before, after, when — in
`records`. The next board can see what changed and undo it on the right page.

**Snapshot loop.** Supabase → `data/*.json` + `content/*.md` nightly. It keeps
Tier 1 current, gives a diffable history in git, and is the restore path if the
database is ever lost (`scripts/snapshot.py --restore`).

**One display face (Unbounded), John Jay's own palette.** The old site's colour
trio, darkened to a modern red; navy from the college's assets; one accent per
section. Not a template; not the previous platform's look.

**Procedural 3D (cube, pitbull), no downloaded models.** Built in Python
(manifold3d) with the parameters in the file, so the board can change a
proportion and rebuild — no Blender, no asset licences, no AI generation.

**Markdown + preview, no rich-text editor.** Headings and paragraphs are all
the public pages render; a textarea with a live preview is honest about that
and has nothing to break.

**Projects, not Apps.** One section and one review queue for apps, tools,
research and class projects — the empty display section is the pitch to
students, not a gap.
