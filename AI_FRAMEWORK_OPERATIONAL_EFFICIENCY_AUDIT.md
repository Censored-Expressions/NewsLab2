# AI Framework Operational Efficiency Audit

## Purpose

This audit analyzes the codebase from an operational-efficiency perspective.

It is not a bug hunt and not a conventional code review. It asks:

- Is a subsystem doing unnecessary work?
- Is it doing work too early?
- Is it doing work twice?
- Could another subsystem do the work once for everyone?

The audit focuses on whether compute, memory, I/O, worker time, reasoning, repair attempts, and synchronization are converting into verified public output.

## Executive Finding

The Framework is not idle. It is doing a large amount of work.

The current inefficiency pattern is:

```text
Large input/state stores
  -> repeated reads/parses/summaries
  -> repeated dossier/writer/editor/repair loops
  -> sync and cache pressure
  -> limited public-output conversion
```

This supports the working diagnosis:

```text
The Framework is often compensating downstream for upstream incompleteness or oversized state.
```

The biggest opportunity is to reduce repeated work before it reaches Writer, Editor, Repair, API sync, or public request paths.

## Evidence Snapshot

### Large Runtime Files

The active project contains very large operational stores:

| File | Size | Efficiency Concern |
| --- | ---: | --- |
| `data/news-lab-story-objects.json` | 192 MB | Too large for frequent full-object reads or broad scans. Needs indexing, summaries, partitioning, or distillation. |
| `data/approval-recovery-queue.json` | 87 MB | Repair history appears to be retained in a way that can become operational weight. |
| `data/headline-repair-queue.json` | 64 MB | Headline repair history is large enough to require compaction and summarized learning views. |
| `data/editorial-learning.json` | 10 MB | Learning memory is useful, but dashboard/request paths should use summary views. |
| `data/newsletters.json` | 9.8 MB | This can exceed default sync-file caps and should be summarized or separately synced. |
| `data/framework-action-log.json` | 9.5 MB | Audit logs need rotation/indexing so they do not become runtime drag. |

### Large Central Runtime

`server.js` is approximately 2.7 MB and contains web serving, APIs, News Lab production logic, diagnostics, market data, learning, repair, sync, and worker modes.

This creates a scaling risk:

```text
Conceptual modularity exists, but too many operational paths still share one large runtime file.
```

## Finding 1 - Runtime Is Still Too File-Centric

### Evidence

`server.js` has a centralized `readJsonFile()` path that uses stat checks, an object cache, synchronous file reads, parsing, and profiler recording.

The cache is valuable, but the architecture is still file-object oriented:

```text
API or worker summary
  -> read JSON file
  -> parse or cache-check object
  -> compute response
```

### Why This Matters

Large files make every missed cache, broad scan, or dashboard refresh expensive.

This is especially risky for:

- Owner Desk views.
- Learning endpoints.
- Article lifecycle traces.
- Production Intelligence reports.
- Worker heartbeat summaries.
- Public API fallback paths.

### Root Cause

Long-term operational memory, audit logs, repair queues, and story objects are being treated like active runtime databases.

### Fix Direction

Create a tiered state model:

```text
Hot Summary State
  -> small, request-safe, frequently served

Warm Indexed State
  -> searchable operational records

Cold Audit State
  -> retained for history, legal, learning, and debugging

Distilled Knowledge
  -> reusable lessons, rules, patterns, capabilities
```

### Work Order

Create a `runtime-summary-store` that precomputes:

- public article counts
- tab counts
- first-pass publication rate
- repair-loop metrics
- top rejection classes
- dossier-readiness metrics
- image status
- worker status
- cache freshness

Owner Desk and public APIs should prefer these summaries over broad file reads.

## Finding 2 - Worker Heartbeat Reads Multiple Files Every Minute

### Evidence

`worker.js` builds `workerArticlePipelineSummary()` from:

- `news-lab-published-payload.json`
- `news-lab-worker-status.json`
- `news-lab-productivity.json`
- `article-approval-intelligence.json`
- `news-lab-image-worker-status.json`
- `news-lab-api-response-cache.json`

It also writes observability on a 60-second heartbeat.

### Why This Matters

The heartbeat is useful, but heartbeat should be cheap. When heartbeat summarizes multiple JSON stores, it risks becoming background drag.

### Root Cause

Observability is being assembled by reading production state instead of being updated as a small side-effect of state changes.

### Fix Direction

Make each subsystem write a compact summary when it changes state.

Then heartbeat reads only:

```text
data/news-lab-runtime-summary.json
```

### Work Order

Add a summary fan-in model:

```text
Production worker
  -> writes production summary

Image worker
  -> writes image summary

Approval worker
  -> writes approval summary

API worker
  -> writes API summary

Heartbeat
  -> reads compact merged summary
```

## Finding 3 - Worker Sync Still Serializes Payloads Twice

### Evidence

`worker.js` collects sync files and computes bytes with:

```text
Buffer.byteLength(JSON.stringify(payload), "utf8")
```

Later the full sync request body is built with another:

```text
JSON.stringify({ files })
```

### Why This Matters

For multi-MB payloads, repeated serialization adds CPU and memory pressure before the request is even sent.

### Root Cause

Sync uses object payloads, then serializes them for size checks and again for network transmission.

### Fix Direction

Use pre-serialized file payloads or hashes:

```text
read raw file once
  -> compute bytes/hash
  -> send raw JSON text or compact delta
```

### Work Order

Introduce a sync envelope:

```json
{
  "key": "",
  "mtimeMs": 0,
  "bytes": 0,
  "hash": "",
  "jsonText": ""
}
```

The server validates and parses only accepted files.

## Finding 4 - Sync Can Skip Large Files That May Still Matter

### Evidence

`worker.js` has a default sync max file size of 8 MB.

Files larger than that are skipped. Current data includes:

- `newsletters.json` at about 9.8 MB
- very large repair and story-object files

### Why This Matters

Skipping large files may be correct for public performance, but the system must distinguish:

```text
safe to skip
```

from:

```text
needs alternate sync/summary/channel
```

### Root Cause

Large operational files do not all have separate compact sync artifacts.

### Fix Direction

Every large file should have:

- compact public/API summary
- owner dashboard summary
- cold archive/retention path
- optional paged detail endpoint

### Work Order

Add large-file sync policy:

```text
If file > sync cap:
  -> do not send whole file
  -> send summary
  -> record skipped-large-file event
  -> expose owner warning if required downstream output depends on it
```

## Finding 5 - Manual Build Endpoint Contains Dead Direct-Build Code

### Evidence

In `/api/news-lab/build-now`, the endpoint sends a `202` response and returns. After that return, there is a large manual direct-build block that cannot execute.

### Why This Matters

Dead production paths create confusion during operational debugging:

- The code appears to support direct manual builds.
- The actual runtime delegates or blocks before that path.
- Future maintainers may patch unreachable logic.

### Root Cause

Build-now behavior evolved from direct inline execution into worker-delegated execution, but the old path remains after the return.

### Fix Direction

Remove or clearly quarantine unreachable direct-build code.

### Work Order

Replace the dead block with one of:

- a deleted legacy path preserved in documentation
- a separate explicitly named admin endpoint
- a feature-flagged reachable code path with tests

## Finding 6 - Dossier Readiness Exists Conceptually But Still Generates Downstream Repair Pressure

### Evidence

The code contains strong rules:

- Writer must consume locked Story Dossier, not RSS.
- Dossier readiness should gate Writer.
- Headline generation should use the completed Story Dossier and body.
- Category should be semantic after dossier completion.

The runtime metrics still show:

- high dossier counts
- high editorial reviews
- high headline blockers
- high repair passes per article
- low repair recovery efficiency

### Why This Matters

This means the rules exist, but the operational conversion is incomplete.

### Root Cause

The system has prevention rules and repair routing, but it still allows too much work to reach Writer/Editor/Repair before the upstream knowledge object is efficient and stable enough.

### Fix Direction

Move from:

```text
rule recorded
```

to:

```text
rule enforced at handoff
```

### Work Order

Create a hard dossier-to-writer contract:

```json
{
  "storyId": "",
  "canonicalEvent": "",
  "primaryActor": "",
  "primaryAction": "",
  "verifiedFacts": [],
  "knownUnknowns": [],
  "attributionPlan": [],
  "semanticCategory": "",
  "headlineInputs": {
    "actor": "",
    "action": "",
    "consequence": ""
  },
  "readyForWriter": true
}
```

Writer and Headline Generator should reject anything missing these fields before drafting.

## Finding 7 - Category Assignment Needs To Be Enforced As A Dossier Output

### Evidence

The code already states:

```text
Collector/source category is only a hint. The locked Story Dossier assigns the final semantic public tab.
```

The user still observes wrong-tab stories.

### Why This Matters

Wrong category placement is not primarily a publication problem. It is a handoff and semantic-classification enforcement problem.

### Root Cause

Collector category, requested tab, article category, and final semantic category can still diverge.

### Fix Direction

Require final public tab assignment from the locked dossier, not from collector or feed category.

### Work Order

Add a `finalSemanticCategory` gate:

```text
Collector category = hint
Source category = hint
Writer category = not authoritative
Locked dossier semantic category = public tab
Publisher enforces final semantic category
```

## Finding 8 - Repair Queues Are Too Large To Be Active Working Memory

### Evidence

Repair queues are tens of MB:

- `approval-recovery-queue.json`: 87 MB
- `headline-repair-queue.json`: 64 MB

### Why This Matters

Large repair queues suggest that rejected work is accumulating faster than it is resolved, distilled, archived, or deleted.

### Root Cause

Repair history is acting as active memory instead of being split into:

- active repair tasks
- resolved outcomes
- distilled lessons
- cold archive

### Fix Direction

Split repair memory:

```text
active-repair-queue.json
resolved-repair-summary.json
repair-learning-patterns.json
repair-archive/
```

### Work Order

Active queue should contain only items that can still become public output.

Anything else becomes:

- distilled learning
- audit archive
- duplicate discard
- expired unresolved item with reason

## Project Reports

## Project 1 - Feed & Collection Efficiency

### Findings

- Collector rotation and underfilled-category prioritization exist.
- Collectors can still produce overlap and downstream category drift.
- Raw collection is not the limiting factor; usable dossier-ready conversion is.

### Deliverable

Feed Efficiency Report should measure:

- feeds polled
- duplicate URLs
- duplicate story events
- collector overlap
- category starvation
- usable source signals per collector
- source-to-dossier conversion

## Project 2 - Story Dossier Efficiency

### Findings

This is the largest opportunity.

The code has the right rule: Dossier before Writer. The runtime still shows downstream repair pressure, meaning the gate should become stricter and more measurable.

### Deliverable

Dossier Efficiency Report should measure:

- dossier builds per public article
- dossier rebuilds per public article
- needs-source-context failures
- readiness gate failures
- thin-dossier blocks
- mixed-event blocks
- final semantic category confidence

## Project 3 - Writer Reasoning Audit

### Findings

Writer Reasoning exists as a named gate, but downstream headline and repair pressure shows that reasoning must be treated as an executable pre-draft contract, not just a proof record.

### Deliverable

Writer Reasoning Audit should measure:

- drafts started with complete dossier
- drafts blocked before writing
- repeated reasoning per repair
- headline inputs available before headline generation
- article failures that should have been prevented by existing memory

## Project 4 - Editorial Prevention Report

### Findings

Editorial Intelligence already routes issues to responsible systems, but repair recovery remains weak.

The Editor should continue identifying failures, but Prevention Intelligence must stop known failure classes before drafting.

### Deliverable

Editorial Prevention Report should classify:

- symptom rejection reasons
- root-cause rejection reasons
- preventable rejection classes
- repair-only classes
- evidence-required classes
- fatal classes

## Project 5 - Runtime Optimization Blueprint

### Findings

Runtime pressure is driven by:

- large JSON stores
- broad summaries
- duplicated serialization
- heavy logs
- repair queues too large for active memory
- monolithic runtime responsibilities

### Deliverable

Runtime Optimization Blueprint:

1. Create summary stores.
2. Split active vs archive repair queues.
3. Precompute Owner Desk panels.
4. Serialize sync payloads once.
5. Remove dead manual-build path.
6. Extract hot-path services from `server.js`.
7. Route large-file access through paged/admin-only endpoints.

## Project 6 - Production Intelligence Report

### Findings

Production Intelligence exists and already reports stage efficiency, blockers, and work orders.

The next step is to make it enforce actions, not only describe them.

### Deliverable

Operational Efficiency Report should track:

- CPU per visible article
- memory per visible article
- repair loops per article
- dossier rebuilds per article
- API calls per article
- time per article
- public article conversion
- public output per worker cycle

## Project 7 - Learning Effectiveness Report

### Findings

The Framework stores learning, but high repeat blockers suggest some lessons are still not changing first-pass behavior quickly enough.

### Deliverable

Learning Effectiveness Report:

- lessons captured
- lessons applied
- lessons that changed first-draft behavior
- duplicate lessons
- stale lessons
- promoted capabilities
- repeated failure class reduction

## Project 8 - Knowledge Architecture Audit

### Findings

The story object file size indicates knowledge storage needs indexing and distillation.

### Deliverable

Knowledge Architecture Audit:

- duplicate entities
- timeline quality
- relationship reuse
- canonical event reuse
- searchability without full-file scans
- hot/warm/cold memory split

## Project 9 - Framework Architecture Improvement Report

### Findings

Responsibilities are mostly defined but not fully enforced:

- Writer should not determine category.
- Collector category should not determine final tab.
- Editor should not compensate for missing dossier completeness.
- Repair should not become the normal production path.

### Deliverable

Architecture Improvement Report:

- responsibility map
- duplicate responsibility map
- upstream/downstream cause map
- extraction candidates from `server.js`
- integration contracts for each subsystem

## Highest-Priority Work Orders

### 1. Build Compact Runtime Summary Store

Create a small summary file updated by workers, not computed by request routes.

Expected impact:

- faster Owner Desk
- lower request-time file parsing
- lower heartbeat cost
- clearer production metrics

### 2. Split Active Repair Queues From Repair Archives

Keep only repairable, publishable candidates in active queues.

Expected impact:

- lower memory/file pressure
- clearer repair recovery metrics
- fewer repeated stale repair attempts

### 3. Enforce Dossier-To-Writer Contract

Writer starts only from a locked dossier with required fields.

Expected impact:

- higher first-pass publication
- fewer headline/body mismatches
- fewer repair loops

### 4. Make Final Semantic Category A Publisher Gate

Publisher uses locked dossier semantic category, not collector/source category.

Expected impact:

- fewer wrong-tab stories
- better tab-specific production
- less post-publication correction

### 5. Replace Object Sync With Serialized Delta Sync

Avoid repeated JSON serialization and skip/flag large files with summary alternatives.

Expected impact:

- lower sync CPU
- lower sync memory
- fewer timeout pressure events

### 6. Remove Or Rehome Dead Manual Direct-Build Code

Make the build-now endpoint reflect one true execution path.

Expected impact:

- less debugging confusion
- safer future patches
- clearer owner controls

## Target Metrics

| Metric | Current Signal | Target |
| --- | ---: | ---: |
| First-pass publication | 17% | 75-90% |
| Repair loops/article | 4.45 | < 1.5 |
| Headline blockers | 538 | < 100 |
| Dossier blockers | 91 | < 20 |
| CPU/article | 32 ms | 15-20 ms |
| Dossier rebuilds/article | High | Near zero |
| Duplicate reasoning | High | Minimal |
| Time to visible article | Current | 40-60% faster |

## Final Conclusion

The bottleneck is not one isolated bug.

The bottleneck is an operational workflow pattern:

```text
The system is doing too much compensating downstream for work that should be completed once upstream.
```

The next engineering sprint should focus on:

1. Turning large active state into compact summaries plus archives.
2. Enforcing the locked Story Dossier as the only Writer input.
3. Preventing repair queues from becoming long-term active memory.
4. Making category assignment a semantic dossier output.
5. Measuring public output per unit of work.

This should improve article production without loosening standards because it attacks wasted work, not editorial quality.
