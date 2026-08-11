# News Lab Teaching: Headline, Navigation, Writer Reasoning

Date: 2026-08-10

## Owner Direction
The owner identified three connected quality gaps:

- Headlines were still reusing similar wording across unrelated articles.
- News Lab tab navigation felt slow because the page waited on a fresh category request before updating the view.
- Writer Reasoning needed a stronger evidence-and-logic structure before article drafting.

## Framework Lesson
News Lab should treat the Story Dossier as the source of truth for every downstream writing decision. The headline must be generated only after the dossier is locked, the article body exists, and Writer Reasoning has mapped the story through claim, evidence, and reasoning.

## New Operating Rules

1. Headline Intelligence must compare each candidate headline against the current CE shelf.
   - Reject headlines that reuse the same structure, ending, or wording pattern from another visible story.
   - Preserve story-specific actor, action, and consequence from the locked dossier.
   - Treat publisher headlines as provenance only, not as wording templates.

2. Writer Reasoning must build a claim-evidence-reasoning model before prose generation.
   - Claim: the central verified development.
   - Evidence: promoted facts tied to fact IDs and source records.
   - Reasoning: the logical bridge explaining why the evidence supports the claim.
   - Unknowns and counterpoints must be named so the article does not hide assumptions.
   - News Lab remains factual; reasoning explains the evidence path without adding opinion.

3. News Lab navigation should render quickly and refresh in the background.
   - Cache each tab response briefly.
   - Render cached tab stories immediately on click.
   - Abort stale category requests.
   - Prefetch other tabs after the first successful load.

## Verification

- `node --check server.js`
- `node --check news-lab.js`

## Reusable Pattern
When the owner identifies repeated language or slow experience, the Brain should determine whether the issue is caused by a missing pre-output contract, missing distinctness check, or request-path blocking. The fix should add a measurable gate or cache layer, then log the effect for future self-improvement.
