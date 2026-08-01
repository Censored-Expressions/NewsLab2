# AI Framework Phase 6 - Production Intelligence & Operational Efficiency Audit

## Purpose

Project 6 is expanded into a full Production Intelligence and Operational Efficiency audit.

The purpose is to determine where the Framework spends compute, memory, API calls, file reads, reasoning cycles, repairs, and worker time without producing proportional public value.

The central question is:

```text
Where is the Framework spending effort that does not become verified visible public output?
```

For News Lab, verified visible public output means a published article that:

- Passes editorial standards.
- Is durably stored.
- Remains visible until tile expiration rules remove it from active tab shelves.
- Keeps its original publish date while showing update timestamps separately.
- Has a suitable image or a tracked post-publication image-repair task.
- Is searchable after it leaves active public tiles.

## Primary Objective

Produce the highest-quality public article with the fewest necessary computational steps.

Production Intelligence does not optimize for raw activity. It optimizes for useful conversion:

```text
CPU
  -> Memory
  -> API calls
  -> Reasoning
  -> Dossier
  -> Writer
  -> Editor
  -> Published Article
  -> Reader Value
```

Every stage must prove that the work it performs increases the chance of a verified public output.

## Current Signal

The Owner Desk metrics show a system that is active but inefficient:

| Metric | Current Signal |
| --- | --- |
| Visible articles | 59 |
| Dossiers completed | 914 |
| Editorial reviews | 914 |
| Repair attempts | 89 |
| First-pass publication | 17% |
| Repair recovery efficiency | 0% |
| Repair passes/article | 4.45 |
| Repair passes/article target | < 1.5 |
| Headline blockers | 538 |
| Dossier blockers | 91 |
| Worker attempts | 8 |

The conclusion is not that the Framework is idle. The conclusion is that too much work is repeated before becoming public output.

## Audit Principle

The Framework must distinguish between work and value.

```text
Work = actions performed by collectors, workers, dossier builders, writers, editors, repair systems, image systems, and publishers.

Value = verified public output, improved first-pass quality, reduced repeated failures, reduced compute per successful article, and reusable learning that prevents future waste.
```

Activity without conversion is not success.

## Stage 1 - Collection Efficiency

### Measure

- Feeds polled.
- Articles collected.
- Duplicate feed items.
- Duplicate URLs.
- Collector idle time.
- Collector overlap.
- Source timeout rate.
- Collector category starvation.
- Collector category leakage.
- Tab-specific usable inputs.

### Output

```text
Collector Efficiency Score
```

### Diagnosis Questions

- How many collected items were unique?
- How many collected items reached sub-dossier creation?
- Which collectors produced material that never became dossier-ready?
- Which categories are being starved?
- Which collectors are overlapping with other collectors instead of increasing coverage?

### Target Behavior

Collectors should maximize tab-specific, unique, usable source signals, not raw feed volume.

## Stage 2 - Dossier Efficiency

### Measure

- Dossier builds.
- Dossier rebuilds.
- Dossier expansions.
- Dossier blocks.
- Average evidence signals per article.
- Duplicate evidence.
- Evidence discarded.
- Canonical event merges.
- Unnecessary clustering.
- Needs-source-context failures.
- Readiness gate failures.
- Dossier stability before writing.

### Output

```text
Dossier Efficiency Score
```

### Core Question

```text
How many dossier builds or rebuilds occurred before one article was successfully published?
```

### Diagnosis Questions

- Did the dossier define one canonical event?
- Did the dossier freeze before Writer Reasoning?
- Did the Writer receive a completed dossier or thin source fragments?
- Did a failed draft return to Evidence/Dossier expansion when source context was missing?
- Did multiple similar stories get separated before reaching the main dossier?
- Did sub-dossiers reduce contamination or merely create extra artifacts?

### Target Behavior

The dossier should be a readiness gate. Writing should not begin until the dossier has enough verified, organized, stable information.

## Stage 3 - Writer Efficiency

### Measure

- Writer attempts.
- Abandoned drafts.
- Thin-body drafts.
- Paragraph rewrites.
- Duplicate reasoning.
- Duplicate evidence reads.
- Repeated planning.
- Writer starts from RSS or source fragments.
- Writer starts from completed Story Dossier.
- Writer Reasoning completeness.
- Plan-alignment failures.

### Output

```text
Writer Efficiency Score
```

### Diagnosis Questions

- Did the Writer consume only a completed Story Dossier?
- Did the Writer reason before drafting?
- Did the Writer prove actor, action, verified facts, uncertainty, attribution, paragraph purpose, and headline inputs before prose?
- Did the Writer repeat the same reasoning already available from the dossier?
- Did a first draft fail for an issue that previous lessons should have prevented?

### Target Behavior

The Writer should draft once from a locked reasoning plan. Rewriting should become rare.

## Stage 4 - Editorial Efficiency

### Measure

- Editorial reviews.
- First-pass approvals.
- First-pass rejection codes.
- Repair attempts per article.
- Repair success.
- Repeated rejection categories.
- Average repair depth.
- Editor time per article.
- Validation time per article.
- Articles abandoned after repair.
- Repair passed but not republished.

### Output

```text
Editorial Efficiency Score
```

### Lifecycle Example

```text
Article 481
  -> Repair 1
  -> Repair 2
  -> Repair 3
  -> Repair 4
  -> Rejected
```

This is not a normal editorial cycle. This is wasted effort unless it produces a reusable prevention rule and stops similar future articles from entering the same loop.

### Diagnosis Questions

- Which rejection code blocked the article first?
- Was the repair targeted to the failed component?
- Did the same rejection code appear after repair?
- Did repair introduce a new problem?
- Did the system learn a prevention rule or only a repair rule?

### Target Behavior

The Editor should identify all actionable issues at once when possible. The repair system should fix the failed component, resubmit, and teach upstream systems how to avoid the same failure class.

## Stage 5 - Runtime Efficiency

### Measure

- CPU per visible article.
- Memory per visible article.
- API calls per article.
- JSON parses per article.
- File reads per article.
- File writes per article.
- Cache hits.
- Cache misses.
- Worker overlap.
- Queue wait time.
- Sync time.
- Endpoint time.
- Public API response time.
- Owner Desk response time.

### Output

```text
Runtime Efficiency Score
```

### Diagnosis Questions

- How much CPU produced one verified visible article?
- How much memory was used per verified visible article?
- Which endpoints read and parse large files during requests?
- Which worker actions overlap unnecessarily?
- Which one-shot tasks are deferred because of runtime pressure?
- Which repeated sync calls produce no public inventory change?

### Target Behavior

The web service should serve prepared public data quickly. Heavy generation, diagnostics, learning, image work, and consolidation should run outside request paths.

## Stage 6 - Knowledge Efficiency

### Measure

- Reused knowledge.
- Newly learned knowledge.
- Duplicate lessons.
- Stale lessons.
- Promoted lessons.
- Discarded lessons.
- Lessons applied.
- Lessons that changed future behavior.
- Lessons that reduced future failures.

### Output

```text
Knowledge Efficiency Score
```

### Diagnosis Questions

- Did the Framework learn only that an article failed, or did it learn why and how to avoid the failure class?
- Did a correction become a reusable behavior?
- Did the lesson apply to future first drafts?
- Did the Framework store raw experience when distilled knowledge would have been enough?
- Did multiple subsystems learn the same lesson independently instead of sharing it?

### Target Behavior

The Brain should retain reusable knowledge, not raw operational clutter.

## Stage 7 - Intelligence Efficiency

### Measure

- Reasoning calls.
- Reasoning reused.
- Reasoning discarded.
- Reasoning contradicted.
- Reasoning accepted by Editor.
- Reasoning that prevented a known rejection.
- Reasoning that reduced repair loops.
- Reasoning that improved first-pass publication.

### Output

```text
Reasoning Efficiency Score
```

### Core Question

```text
Was the reasoning useful?
```

The Framework should not merely prove that reasoning occurred. It should prove that reasoning improved the outcome.

### Target Behavior

Reasoning should reduce downstream repairs, prevent known error classes, improve editorial acceptance, and shorten time to public output.

## Production Efficiency KPIs

| Metric | Target Direction |
| --- | --- |
| CPU per visible article | Lower |
| Memory per visible article | Lower |
| API calls per article | Lower |
| JSON parses per article | Lower |
| File reads per article | Lower |
| File writes per article | Lower |
| Repair loops per article | < 1.5 |
| Dossier rebuilds per article | < 0.5 |
| Duplicate reasoning | Near 0 |
| Duplicate file reads | Near 0 |
| Duplicate API calls | Near 0 |
| Time to first public article | Lower |
| First-pass publication rate | > 80% |
| Recovered publication rate | Higher |
| Public articles per CPU minute | Higher |
| Public articles per GB RAM | Higher |

## Value Conversion Rates

Production Intelligence should track conversion between every major stage:

```text
Feed -> Dossier
Dossier -> Draft
Draft -> Self Review
Self Review -> Editor
Editor -> Approved
Approved -> Durable Public Payload
Durable Public Payload -> Visible Tile
Visible Tile -> Reader Engagement
```

Large drops identify bottlenecks or wasted effort.

## Public Inventory Rules

Efficiency optimization must not cause public inventory loss.

Rules:

- New approved articles should be added to public inventory.
- Articles should not be replaced unless they are duplicates, expired from active tiles, or superseded by a verified update.
- Active tab tiles should respect the seven-day active window.
- Top News should cap at 20 active tiles based on importance and recency.
- Other tabs should not be capped by count, only active tile expiration.
- Expired articles should remain searchable.
- Cache refreshes must not reset original publish dates.
- Updates should use separate updated timestamps.
- Minor post-publication corrections should update the article in place instead of removing it.
- Image improvements may occur after publication if the article keeps a tracked image task and the replacement passes relevance and license checks.

## Production Intelligence Decision Rule

Every cycle should produce one bounded answer:

```text
What caused unnecessary work today?
```

The answer must include:

- The earliest inefficient stage.
- The shared or isolated root cause.
- The affected subsystems.
- The wasted work observed.
- The proposed bounded fix.
- The expected measurable outcome.
- The rollback or stop condition.

## Dashboard Requirements

The Owner Desk should expose a Production Efficiency panel with:

- Collection Efficiency Score.
- Dossier Efficiency Score.
- Writer Efficiency Score.
- Editorial Efficiency Score.
- Runtime Efficiency Score.
- Knowledge Efficiency Score.
- Reasoning Efficiency Score.
- CPU per visible article.
- Memory per visible article.
- Repair loops per article.
- Dossier rebuilds per article.
- Duplicate reasoning count.
- Duplicate file read count.
- First-pass publication rate.
- Recovered publication rate.
- Public articles per CPU minute.
- Public articles per GB RAM.
- Weakest conversion stage.
- Highest-value next intervention.

The panel should make it easy to see whether the Framework became more efficient, not merely busier.

## Learning Requirement

Every inefficiency finding should become a reusable prevention rule when possible.

Example:

```text
Finding:
headline-lead-topic-mismatch repeated after three repair attempts.

Root Cause:
Headline was generated before the Story Dossier and Writer Reasoning plan stabilized.

Prevention Rule:
Do not generate final headline until after locked dossier, paragraph plan, and lead are complete.

Expected Outcome:
Reduce headline mismatch repairs and raise first-pass approval.
```

The Framework should learn how to avoid failure classes, not merely how to patch individual failed articles.

## Final Deliverable

Project 6 should produce a daily Production Intelligence report answering:

- What useful public output was produced?
- How much work did it cost?
- Where was work wasted?
- Which failures repeated?
- Which reasoning was useful?
- Which learning changed behavior?
- Which single bounded improvement should run next?
- Did the previous improvement reduce cost per public article?

Success means the Framework publishes more high-quality articles with less repeated work, fewer repair loops, lower runtime pressure, and stronger first-pass publication.
