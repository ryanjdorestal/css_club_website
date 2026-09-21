---
type: decision
title: Adopt the new site + CSS OS as the club's platform
term: F26
date: 2026-09-21
status: final
owners: [the board]
visibility: board
tags: [platform, infrastructure]
summary: The old GitHub-Pages site is replaced by the React site + the board platform (CSS OS) built by Ryan Dorestal; the board owns it from the first login.
links:
  - label: Repository
    url: https://github.com/jjcss
  - label: Setup steps (SETUP.md)
    url: https://github.com/jjcss/CSS_Website/blob/main/SETUP.md
---

## Context

The old site (jjcss/CSS_Website, last commit a8fca55 in April 2025) was static HTML with copy pasted into pages; events, board bios and resources went stale every term because updating them meant a pull request. Discord invites and forms were hard-coded and expired. Nothing recorded why past boards did what they did.

## Decision

Adopt the new platform built over September 2026: the public site at jjaycss.tech and CSS OS at /os. The board edits posts, projects, events, resources, links, the roster and this inheritance spine through the OS; the public site reads the same data. Everything also works with zero accounts (Tier 1) from the committed files in the repository, so a board with no developer can still run it.

## Alternatives we rejected

Keeping the static site and editing HTML by pull request (what made it go stale). A hosted CMS with a paid plan (a subscription a club cannot own across graduations). A Discord-bot-driven workflow (needs a bot token that someone has to keep alive).

## Consequences

Two people must hold each account (see System → Ownership). Each outgoing officer files a handoff here in the last four weeks of the term. The webmaster runs the eight SETUP steps once to go live; after that, no deploys are needed for content.
