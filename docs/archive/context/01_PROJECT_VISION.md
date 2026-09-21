# 01 — Project vision

## Why

Student clubs lose their web presence every 2–4 semesters. John Jay's CSS is a live
example: the site is up, the repo is public, and nobody can deploy it. The person who
held the hosting login graduated. Ryan already solved the *continuity* problem once for
LaGuardia with `rhecweb` / RHEC OS (a platform whose whole reason to exist is
institutional memory across board terms). John Jay gets the same platform, plus a
public surface good enough that students want to put their name on it.

Ryan's own framing (verbatim from the session):

> "the whole point of me doing this was just to make a barebones site for johnjay's cs
> club forked from the existing lagcc one I alr made, but few things have to be thought
> out, I need to make the site such that people can actually contribute to it"

> "lets not make the platform shitty lets make it good, despite only knowing c++
> students had hella commits on there so no way its not possible to do something truly
> awesome make it look like a cool web3 site lol"

> "most of the blueprint rhec alr got im just gonna change how it looks and adapt it
> for jj and use their themes logos and existing stuff and then modernize it into
> something cool with animations and stuff and more functionalities on their platform
> and a apps section for students to link their own personal projects"

## Goals

1. **A public site that survives graduation.** Deploys from `main` automatically. No
   single human holds the only key. Public pages need zero backend to render.
2. **An internal platform for the board** (RHEC OS, reskinned): onboarding queue,
   member directory, board notes, records/handoffs, events, bulletins, opportunities.
3. **An Apps section**: John Jay students submit apps they've built (must relate to
   John Jay or benefit John Jay students), board approves, it's published with author,
   platform, stack, links, screenshots.
4. **A look that's modern and specific**: dark, industrial-editorial, one accent per
   section, the 3D cube as the identity object. Explicitly *not* the generic AI-site look.
5. **Résumé-worthy for contributors**: React + TypeScript on the front, Python on the
   back, real CI, real users. The thing a reviewer at a big company would respect.
6. **Reusable**: `rhecweb` becomes a platform any CUNY club deploys with a brand config.
   John Jay is tenant #2. Rebranding must not be a 4,195-string find-and-replace again.

## Non-goals

- Not a "barebones template a freshman edits" (that was the opening idea; abandoned
  once the data showed the real contributors are the board — see below).
- Not a re-implementation of RHEC OS. Extract, don't rewrite.
- Not a Web3 *product*. "Web3 site" means the aesthetic (dark, glow, big type, 3D), not
  wallets or chains. Ryan explicitly does not want to be mistaken for a blockchain person.
- Not C++ in the request path. C++ shows up via WebAssembly demos/workshops only.

## Who the real users are (this changed the plan)

Measured on `jjcss/CSS_Website`: 82 commits total, **48 by two people**, one of whom
had a BMCC (not John Jay) email. All 2024–25 activity was the board. "Students
contributing" never happened at scale. So:

- **Primary users:** the ~5-person board (OS tooling matters most) and students
  submitting apps (submission flow matters).
- **Secondary:** the public — prospective members, John Jay admin, sponsors.
- **Not a design target:** a random CSCI 271 student editing CSS. Nice if it works;
  don't compromise the platform for it.

## Constraints Ryan set

- Free to run, or as close as possible. (Vercel/Netlify/Supabase free tiers are
  acceptable; "someone pokes it once in a while" is an acceptable ops model — see 04.)
- Keep Vercel + Supabase. Don't switch platforms.
- Languages should be things students can plausibly learn/use: Python, SQL,
  JavaScript/TypeScript, React. C++ where it's honest (WASM).
- The chatbot does not need an LLM key — rhecwb's assistant already works keyless from
  a static knowledge base; the LLM is additive.
- Use the club's existing identity (cube, binary rings, stamp, taglines) — modernized,
  not replaced.
- Ryan is the one who decides when building starts. Until then: theory, specs, context.
