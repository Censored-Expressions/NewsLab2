# Article Intelligence Teaching: Intelligence Workspace

## Owner Direction
The Brain should become an intelligence workspace, not merely a news reader.

## Workflow
Breaking Event
-> Articles arrive
-> Brain groups similar stories
-> Brain measures agreement
-> Brain finds contradictions
-> Brain creates timeline
-> Brain scores confidence
-> Brain updates as new evidence arrives

## Code-Level Pattern
For each article cluster, the Brain now creates an event case file with:
- event key and event title
- source count
- article count
- deep-read count
- shared claims across sources
- source-specific claims
- possible contradictions
- timeline entries
- agreement score
- contradiction score
- confidence score
- next intelligence action

## Publishing Rule
Shared claims become the factual spine for CE Media reporting.
Unique or disputed claims require source attribution.
Low-confidence or contradiction-heavy events should keep absorbing evidence before becoming strong editorial conclusions.

## Verification
- `server.js` passes `node --check`.
- `/api/article-intelligence` exposes `intelligenceWorkspace`.
- Cluster summaries expose `eventWorkspace`, confidence, agreement, contradiction, and timeline evidence.

