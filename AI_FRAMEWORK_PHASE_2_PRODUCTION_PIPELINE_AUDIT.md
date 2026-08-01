# AI Framework Phase 2 Production Pipeline Audit

Project: Censored Expressions AI Framework / News Lab V2  
Scope: Production pipeline only. This audit walks one story path from intake to public view and identifies what enters, what leaves, what blocks, what retries, whether retries are necessary, and what can be eliminated.

## Executive Finding

The production pipeline exists, but the current lifecycle trace shows mixed signals between newly generated story state and preserved public shelf state.

Latest inspected lifecycle evidence:

| Metric | Value |
| --- | ---: |
| Source input stories | 42 |
| Raw article clusters | 36 |
| Event clusters | 36 |
| Writing clusters | 10 |
| Dossiers | 6 |
| Generated stories | 0 |
| Editor input stories | 0 |
| Publishable stories | 0 |
| Final stories | 7 |
| Verified published count | 6 |
| Elapsed | 294,579 ms |

This means the pipeline can preserve and expose public stories, but the trace does not clearly prove that a newly generated story moved through every stage in that same cycle. That is the first Phase 2 issue: the lifecycle trace should separate current-cycle creation from preserved/public-shelf restoration.

## One-Story Walkthrough

The inspected trace includes a politics story with this stop point:

```text
Publisher
  -> not-in-board-filtered-public-payload
  -> Repair the merge, duplicate, expiry, or board policy decision that removed this article before public view.
```

For that story:

- RSS Collection passed.
- Evidence Collection passed.
- Story Dossier passed.
- Writer Reasoning passed.
- Draft Generated passed.
- Headline Generated passed according to the stage, but the headline audit still showed weak/generated headline candidates and mojibake in the visible text.
- Publisher stopped the story from public visibility.

The important conclusion is that not every blocked article is failing at the Writer or Editor. Some stories pass major production stages and then stop at board policy, duplicate filtering, cache merge, expiry, or public payload visibility.

## Pipeline Stage Audit

| Stage | What Enters | What Leaves | What Blocks It | What Retries | Is Retry Necessary? | Can It Be Eliminated? |
| --- | --- | --- | --- | --- | --- | --- |
| RSS | Source URLs, NewsData, collector cache, local memory. | Raw source stories. | Feed timeout, source error, stale cache, category starvation. | Collector retry, source rotation, cache fallback. | Yes, for network instability. | No, but retries should be source-specific and budgeted. |
| Normalization | Raw source stories. | Clean source story objects with title, summary, source, category hint, URL, timestamp. | Missing title/URL, malformed dates, mojibake, source fragments. | Clean/reparse, fallback to title/summary, quarantine broken item. | Sometimes. | Reduce by normalizing once at intake and storing normalized source objects. |
| Clustering | Normalized stories. | Same-event raw clusters. | Keyword-only grouping, mixed topics, duplicate sources, weak overlap. | Recluster with stricter same-event checks. | Yes when topic mixing is detected. | Partially: use sub-dossiers before main dossier to reduce reclustering. |
| Dossier | Same-event cluster, source pool, facts, source registry. | Locked Story Dossier or needs-dossier-evidence record. | Missing source context, too few verified facts, unresolved identity, moving evidence. | Dossier expansion, evidence recollection, identity resolution. | Yes. This retry protects quality. | Do not eliminate, but move it before writing so it prevents repair loops. |
| Reasoning | Locked Story Dossier, editorial memory, lexicon, historical context, prevention rules. | Writer Reasoning Plan with actor, action, consequence, uncertainty, attribution, paragraph plan. | Missing actor/action, weak attribution plan, unknowns not separated, low dossier readiness. | Return to Dossier/Evidence. | Yes when reasoning proves missing evidence. | Eliminate post-draft reasoning retries by requiring reasoning before prose. |
| Writer | Reasoning Plan and locked dossier only. | Draft body and summary. | Thin body, incomplete structure, public/process language, repetition, paragraph drift. | Draft Optimization Engine repairs language/structure. | Sometimes. | Many Writer retries can be eliminated by stronger pre-draft reasoning and pre-editor optimization. |
| Headline | Completed body, locked dossier, headline dossier fields. | CE-owned headline candidates and selected headline. | Word salad, generic headline, headline/body mismatch, publisher similarity, truncation. | Headline-only repair. | Yes, but should be cheap. | Mostly: generate only after body and reasoning are complete. |
| Editorial | Draft, headline, dossier, evidence, image status, category. | Approved story, repairable rejection, or held record. | Headline integrity, evidence depth, language integrity, story identity, image mismatch. | Targeted repair by responsible subsystem. | Yes. | Reduce by moving common editorial memory upstream before Writer. |
| Repair | Rejection codes, full story snapshot, dossier, body, headline, editor notes. | Repaired article and fresh validation result. | Missing story snapshot, generic repair, repair does not replace active version, resubmission skipped. | Targeted repair then resubmit. | Yes for repairable issues. | Eliminate broad rewrites; keep only component-specific repair. |
| Image | Image Dossier, story ID, category, entities, license policy. | Licensed or CE-generated image, or attached image work item. | No provider match, license uncertainty, topic mismatch, one-shot starvation. | Persistent image queue, provider retry, generated-image fallback. | Yes, but should not block clean text publication. | Eliminate article removal for image-only issues; upgrade post-publication. |
| Publish | Approved/repaired story, public shelf, archive, category policy, dedupe policy. | Durable public payload and searchable archive update. | Duplicate merge, board cap, expiry rule, stale cache, prepared payload not refreshed. | Merge/rebuild cache/public payload verification. | Yes when public visibility fails. | Reduce by making publish atomic: approved -> merge -> cache -> API verify. |
| Public API | Durable public payload and prepared cache. | `/api/news-lab` response. | Slow JSON reads, stale prepared cache, category filter mismatch, sync timeout. | Serve prepared cache, rebuild asynchronously. | Yes for transient API failures. | Eliminate synchronous heavy rebuilds inside request path. |
| Website | Public API response, tab filter, tile policy, search archive. | Visitor-visible tiles and searchable articles. | Wrong category, 7-day rule mistake, top-news cap, duplicated/expired tile replacement. | Client refresh, cache refresh, board policy repair. | Sometimes. | Reduce by treating display as read-only over verified public payload. |

## Necessary Retries

These retries should remain because they protect quality:

- Feed/source retry for transient network issues.
- Dossier expansion when source context is missing.
- Reasoning hold when canonical actor/action/evidence is incomplete.
- Headline-only repair.
- Component-specific editorial repair.
- Image provider retry or generated fallback.
- Public visibility verification after publish.

## Retries To Eliminate Or Compress

These retries waste production capacity:

- Writer retries caused by incomplete dossiers.
- Whole-article rewrites for headline-only failures.
- Repeated repair without fresh validation clearing the original issue.
- Rebuilding headline/body from raw RSS fragments after a story snapshot already exists.
- Public cache rebuilds that replace or shrink the shelf instead of adding/updating verified stories.
- Image work that repeatedly starts without a persistent story-attached Image Dossier.

## Current Bottleneck Hypotheses

### 1. Trace State Is Not Cleanly Separated

The latest trace shows:

```text
Generated stories: 0
Editor input stories: 0
Final stories: 7
Published: 6
```

That can happen if the lifecycle report is inspecting preserved/final stories after the worker cycle rather than tracing only stories born in that cycle.

Required fix:

```text
currentCycleStories
preservedShelfStories
repairedCarryoverStories
archivedSearchableStories
```

must be counted separately.

### 2. Publisher/Public API Can Be The Stop Point

At least one inspected story reached the Publisher stop point:

```text
not-in-board-filtered-public-payload
```

That means approved or near-approved content can disappear after editorial work because of board policy, merge, duplicate, expiry, or cache visibility logic.

Required fix:

```text
Approved
  -> durable merge
  -> board policy decision
  -> prepared cache refresh
  -> public API verification
  -> website tile/search verification
```

must be recorded as separate stages with exact reasons.

### 3. Headline Stage Can Report Passed While Audit Shows Weakness

The inspected trace showed a passed headline stage, but the headline audit still contained weak/generated candidate evidence and mojibake. This means headline pass/fail needs to distinguish:

- candidate passed,
- fallback selected,
- final public headline safe,
- final public headline clean encoding,
- headline/body aligned.

Required fix:

Only the final public headline should determine the Headline stage result.

### 4. Image Should Be Post-Publication Repairable

Image issues should remain tracked through Image Dossier and story-attached work items, but should not remove otherwise clean articles from public view.

Required fix:

```text
Text approved + image weak
  -> publish with temporary CE fallback
  -> keep image work item attached
  -> upgrade image after relevance/license verification
```

## Required Lifecycle Record

Every story should carry this record:

```json
{
  "storyId": "",
  "cycleId": "",
  "origin": "current-cycle | repaired-carryover | preserved-shelf | archive",
  "currentStage": "",
  "enteredAt": "",
  "leftAt": "",
  "blockedBy": "",
  "retryCount": 0,
  "retryNecessary": true,
  "retryEliminationRule": "",
  "ownerSubsystem": "",
  "nextAction": "",
  "publicVisibility": {
    "durablePayload": false,
    "preparedCache": false,
    "apiVisible": false,
    "websiteVisible": false,
    "searchable": false
  }
}
```

## Phase 2 Recommendations

1. Split lifecycle metrics by story origin: current-cycle, repaired carryover, preserved shelf, searchable archive.
2. Make Publisher/Public API visibility a first-class audit stage with exact board-policy, dedupe, expiry, cache, and API reasons.
3. Treat final public headline safety as the only Headline pass condition.
4. Keep image repair persistent and story-attached, but do not block clean article publication for fixable image issues.
5. Require every retry to declare whether it is necessary and what upstream change would eliminate it.
6. Add a `retryEliminationRule` whenever the same retry appears more than once for the same failure class.

## Phase 2 Verdict

The pipeline is no longer missing major stages. The main weakness is that several stages still blur together:

- new story generation vs preserved shelf restoration,
- editorial approval vs visible publication,
- headline candidate repair vs final public headline safety,
- image selection vs image work queue,
- retry as quality protection vs retry as wasted work.

The next maturity jump is not adding more stages. It is making every stage produce a clean handoff record and making every retry prove that it is necessary.
