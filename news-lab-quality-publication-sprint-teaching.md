# News Lab Quality Publication Sprint Teaching

Created: 2026-08-11

## Objective

Increase verified-visible public articles without lowering dossier, reasoning, attribution, headline, editorial, or factual-integrity standards.

## Production Path

Every public News Lab candidate must move through this path:

1. Canonical Event
2. Dossier Integrity
3. Story Understanding
4. Writer Reasoning Contract
5. Paragraph-to-fact assignment
6. Plan-based body
7. Canonical headline service
8. Editorial review
9. Targeted repair
10. Public shelf merge
11. Verified-visible measurement

Generic fallback writing is not a production path.

## Depth Lanes

Separate integrity from depth:

- `developing-brief`: strong event identity with limited evidence.
- `standard-article`: strong event identity with adequate evidence.
- `deep-article`: strong event identity with rich evidence.
- `recovery`: weak, mixed, unsupported, or identity-uncertain event.

Developing briefs may be shorter, but they may not relax event identity, source truth, headline truth, or attribution integrity.

## Headline Rule

Headlines are cheap to fix before the Editor:

- generate multiple candidates from the locked dossier, reasoning plan, and completed body;
- reject weak candidates internally;
- publish only a validated CE-owned headline;
- never let the Editor be the first detector of headline/source mismatch, headline/lead mismatch, truncation, word salad, generic phrasing, or publisher imitation.

## Repair Rule

Repair components, not whole articles:

- headline failure -> headline-only repair, max 2;
- body failure -> affected passages only, max 2;
- missing evidence -> dossier enrichment, max 1;
- mixed event -> cluster split or dossier rebuild;
- image failure -> Image Intelligence only, max 0 writing loops;
- language cleanup -> max 1.

If the repair budget is exhausted, hold the candidate, preserve the dossier, save the learning, and move capacity to the next event.

## Image Rule

Text approval and image readiness are separate states:

- `TEXT_APPROVED`
- `IMAGE_PENDING`
- `PUBLIC_READY`

A missing or temporary image should never cause Writer/Editor repair loops for an otherwise sound article.

## Shelf Rule

Preserve Safe Sync. Public publication is merge-based:

existing active shelf + new verified approvals - expired/replaced same-event stories = new public shelf

Never replace the public shelf with a small current batch.

## Measurement

Each sprint candidate records:

- `sprintId`
- `cycleId`
- `workflowVersion`
- `eventId`
- `dossierRevisionId`
- `reasoningPlanId`
- `headlineServiceVersion`
- `firstPassResult`
- `repairCount`
- `finalApproval`
- `verifiedVisible`

Sprint dashboards must measure only the isolated cohort, not historical public shelf articles.

## Promotion Rule

Promote changes only when first-pass approval and verified-visible output improve while headline mismatch, topic contamination, and factual-integrity failures stay flat or improve. Roll back regressions.
