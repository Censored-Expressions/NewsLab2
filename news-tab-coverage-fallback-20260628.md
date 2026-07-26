# News Tab Coverage Fallback Teaching

Date: 2026-06-28
Target: News Tab subsystems, News Creation, Site Performance

## Problem
Owner Desk showed every major news tab at low readiness because tab metrics reported `storyCount=0`, even while the public news payload had live stories. The Brain was judging the tabs only from News Lab owned-story metrics, which may not exist until the deeper builder runs.

## Rule
News tabs must never rely on one metric source. If News Lab owned-story metrics are missing or empty, use the live public news payload as a temporary coverage proof and fallback.

## Runtime Behavior
- Use News Lab owned articles when available.
- If a tab has no owned articles, populate it from live public feed stories for the matching category.
- Mark those stories as fallback coverage.
- Keep the tab visible and useful while the Brain rebuilds deeper CE Media articles.

## Governance
Fallback coverage is a temporary runtime safety net. It does not replace the deeper requirement that the Brain absorb same-event source coverage and generate original CE Media articles.

## Success Standard
The tab subsystem closes the loop when:
- storyCount is no longer zero for active tabs,
- coverageGap is reduced,
- public tab pages return usable stories,
- the Brain logs that fallback coverage was used,
- deeper owned articles replace fallback stories after enough source absorption.
