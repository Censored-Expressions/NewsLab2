# News Lab Throughput Audit - 2026-08-13

## Applied Stabilization Fixes

- Restored `newsLabApprovalRecoveryQueueSummary()` so Production Intelligence and Owner Desk observability can summarize approval recovery without a ReferenceError.
- Updated reasoning body thresholds by lane: breaking briefs can publish as concise briefs, developing briefs require moderate depth, standard/deep stories still require stronger bodies. This avoids padding thin but valid stories into topic drift.
- Expanded relevant fact extraction to consider article summaries, descriptions, original headlines, and more sentence-level facts before dossier/writer handoff.
- Added worker-recovered stories to the publishable candidate set after they pass the same public/blocking validation as regular approved stories.
- Fixed `npm run check:syntax` so it no longer references the absent `news-lab-viewer.js` file.

## Rule Learned

Throughput must improve by moving valid recovered work forward and by matching article-depth standards to dossier depth. The Editor standard stays intact; the Writer and recovery stages must provide better candidates.
