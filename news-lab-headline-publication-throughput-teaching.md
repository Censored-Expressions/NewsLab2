# News Lab Teaching: Headline Publication Throughput

Date: 2026-08-11

## Owner Direction
Good dossier and Writer Reasoning work was still failing to reach publication. The latest worker evidence showed first-pass drafts existed, but final approval stayed at zero because headline blockers did not repair away.

## Framework Lesson
Headline quality is not improved merely because headline code changes. A headline improvement must raise first-pass approval, reduce mismatch classes, reduce repair rounds, and increase verified-visible output.

## Executable Rules Added

1. Canonical headline validation is mandatory for every public article tier.
   - Standard, deep, developing, and brief articles all require a valid final headline.
   - Article body depth may vary by tier; headline truth requirements do not.

2. Diagnostic candidates are separated from publication headlines.
   - `selectedCandidate` is diagnostic.
   - `publicationHeadline` exists only when the exact final normalized CE-owned headline passes the hard gate.
   - Downstream publication code must use `publicationHeadline`, not a fallback title.

3. Normalize before validation.
   - Candidate generation happens first.
   - CE-owned headline normalization happens next.
   - The final normalized text is then validated.
   - No headline may change after approval.

4. Causal repair routing now distinguishes headline/body/dossier failure.
   - If locked dossier and body agree but headline disagrees, route headline-only.
   - If body disagrees with dossier, route Writer Reasoning/body repair.
   - Rebuild the dossier only when event identity or dossier evidence is invalid.

5. Headline telemetry is immutable.
   - Each public story records headline service version, event ID, dossier revision, reasoning plan ID, candidate count, candidate scores, selected candidate, publication headline, editor result, repair count, final approval, and public visibility.
   - Production Intelligence aggregates per-version metrics so future headline changes can be compared against prior cohorts.

## Verification

- `node --check server.js`

## Promotion Rule
Promote a headline algorithm only when its cohort lowers headline mismatch and repair attempts while raising first-pass article approval and verified-visible publication.
