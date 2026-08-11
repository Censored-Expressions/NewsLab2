# News Lab Teaching: Production Waste Control

Date: 2026-08-10

## Owner Direction
The latest production review showed headline failures, paragraph contamination, excessive repair loops, image readiness blocking text approval, and slow `/api/news-lab` responses.

## Framework Lesson
The Brain should prevent repeated downstream repair by enforcing stronger preconditions before publication:

- Headlines must be generated from locked dossier + validated Writer Reasoning + validated article lead/body.
- Headline failure should be cheap candidate rejection, not a full article repair lifecycle.
- Paragraphs must stay bound to assigned fact IDs or approved reasoning/context bridges.
- Image readiness belongs to Image Intelligence and must not block already-approved text.
- Public tab requests should serve compact prepared payloads and let background workers refresh larger audit/durable state.

## Executable Rules Added

1. Canonical Headline Service now uses a five-candidate hard gate.
   - At least five candidates are assembled from dossier identity, completed article, owned fact headlines, and structural actor/action/consequence fallbacks.
   - Each candidate is scored against evidence overlap, natural grammar, truncation, publisher distance, shelf distinctness, and dossier agreement.
   - Candidate failures remain internal and do not trigger full article repair loops.

2. Writer Reasoning now enforces paragraph fact contracts.
   - Each paragraph is checked against its assigned `allowedFactIds`.
   - Context paragraphs may use the approved claim-evidence-reasoning bridge.
   - Paragraphs that escape their assignments trigger `paragraph-fact-contract-failed`.

3. Repair budgets are now explicit.
   - Headline repairs: maximum 2 rounds.
   - Body/language repairs: maximum 2 rounds.
   - Dossier enrichment: maximum 1 targeted round.
   - Image repair: 0 article repair rounds; route to Image Intelligence.
   - Over-budget items are held/recycled instead of recomputed through general repair.

4. Image-only issues are separated from final text blocking.
   - Image quality/provenance issues remain visible to Image Intelligence.
   - Final text approval no longer treats image-only problems as article-body failures.

5. `/api/news-lab` public requests now prefer compact prepared cache.
   - Normal tab clicks avoid reading the heavy durable payload when the prepared category cache meets the story floor.
   - Background workers refresh and reconcile the durable shelf.

## Verification

- `node --check server.js`
- `node --check news-lab.js`

## Reusable Pattern
When production metrics show high repair loops, the Brain should add a pre-output gate or targeted budget rather than adding another general repair pass.
