# Headline Constitution Gate Teaching

Version: 20260809-headline-constitution-gate

## Failure Observed
Headline memory contained malformed outputs such as:

- `Ukraine's Raises International Response`
- `Friday Raises International Response`
- `Netflix Stock Hits Draws Market Scrutiny`

These are not just weak headlines. They prove actor/action/consequence extraction allowed invalid semantic inputs into publication.

## New Rule
Headline advice is no longer enough. News Lab headlines must pass deterministic gates before the Editor sees them.

## Required Stages
1. Headline reasoning from locked dossier:
   - primary actor
   - primary action
   - event object or subject
   - verified consequence only when supported
   - location/time only when material

2. Strategy selection:
   - News Lab defaults to direct and informative.
   - SEO/direct is allowed for weather, public service, school, recall, safety, tax, and search-heavy stories.
   - Impact-focused is limited.
   - Curiosity/unconventional forms are not default News Lab forms.

3. Candidate scoring:
   - Generate multiple candidates.
   - Reject malformed actor/action pairs.
   - Reject vague forced consequences.
   - Reject publisher imitation, truncation, word salad, unsupported claims, and weak openings.
   - Pick the highest-scoring candidate that passes.

## Hard Gate
A headline must make grammatical and semantic sense without reading the article.

Required:
- supported actor
- meaningful active action
- supported object or subject

Optional:
- verified consequence
- location
- time element

Never invent a consequence just to fill a template.

## Examples Rejected
- `Friday Raises International Response`
- `Ukraine's Raises International Response`
- `Netflix Stock Hits Draws Market Scrutiny`
- `Iran Raises Local Response`
- `Global Raises International Response`

## Future Use
When Headline Intelligence detects repeated malformed headline memory, it must strengthen executable gates rather than adding more writing guidance.
