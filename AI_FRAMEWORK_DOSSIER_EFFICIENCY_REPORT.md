# Project 2 - Dossier Efficiency Report

## Purpose

This report audits the Story Dossier stage as the primary conversion point between collected source material and public News Lab articles.

The central question is not whether the system collects enough news. It does. The question is whether collected signals are being converted into one clean, complete, stable Story Dossier before the Writer, Headline Builder, Image Intelligence, Editorial Intelligence, and Publisher act.

## Executive Finding

The Story Dossier is the biggest current leverage point because most downstream failures trace back to incomplete or unstable story knowledge.

The codebase already contains strong rules that say the Writer should consume only completed Story Dossiers. The problem is that dossier completion is distributed across several readiness signals instead of enforced through one canonical handoff contract.

Observed current dossier recovery state:

| Signal | Value |
| --- | ---: |
| Dossiers queued for recovery | 14 |
| Full-article ready | 0 |
| Developing-brief ready | 2 |
| Needs enrichment | 11 |
| Needs identity resolution | 1 |
| Needs source context blockers | 5 |
| Needs two unique verified facts blockers | 6 |
| Needs clear actor/action/event blockers | 1 |

This means the bottleneck is not simply "the Writer writes poorly." The root cause is earlier:

```text
Collected source signals
  -> weak or partial evidence promotion
  -> incomplete single-event dossier
  -> Writer/Headline/Editor forced to compensate
  -> repair loops
  -> low first-pass publication
```

## Question 1 - When Is A Dossier Considered Complete?

The intended rule in the project is clear:

```text
Collector
  -> Cluster
  -> Evidence Engine
  -> Context Engine
  -> Story Dossier
  -> Dossier To Writer Handoff
  -> Article Writer
```

In practice, the code checks completion through multiple signals, including:

- `storyDossier.dossierBuilder.readyForWriter`
- `writerDossierInput.readiness.readyForWriter`
- `dossierReadiness.readyForWriter`
- `dossierWriterHandoff.readyForWriter`
- lifecycle stage status for `Story Dossier Built`
- lifecycle stage status for `Dossier To Writer Handoff`
- readiness tiers such as `READY_FOR_STANDARD_ARTICLE`, `READY_FOR_BREAKING_BRIEF`, and `HOLD_FOR_EVIDENCE`

That means dossier completion is a concept, but not yet a single authoritative state.

### Required Completion Definition

A Story Dossier should be considered complete only when it has all of the following:

| Requirement | Completion Test |
| --- | --- |
| Canonical event | One primary event ID with no unresolved mixed-topic contamination. |
| Primary actor | Clear person, organization, agency, team, company, court, official, or other actor. |
| Verified action | A specific action, decision, event, ruling, result, announcement, incident, or change. |
| Verified facts | At least two clean same-event facts for a developing brief, three or more for a standard article. |
| Source context | At least one usable source record with attribution, URL, source name, and event relevance. |
| Timeline | At least one usable time marker: first reported, event time, publication time, update time, or next expected step. |
| Unknowns | Explicit known unknowns or uncertainty status for developing stories. |
| Contradictions | Conflicts resolved, removed, or marked as unresolved. |
| Semantic category | Final category assigned from the canonical event, not just collector/feed category. |
| Writing boundary | Clear statement of what the Writer may and may not infer. |
| Headline inputs | Actor, action, consequence, and forbidden copied phrases available to Headline Intelligence. |
| Image brief | Event-safe visual description and disallowed misleading image concepts. |

If any critical field fails, the result should be:

```text
needs-dossier-evidence
```

not:

```text
draft anyway
```

## Question 2 - Why Are Only A Fraction Of Collected Stories Becoming Viable Dossiers?

The dossier recovery queue shows the main reasons:

| Blocker | Meaning | Correct Owner |
| --- | --- | --- |
| `needs-source-context` | The system has a lead but not enough usable reporting context. | Evidence Engine / Dossier Builder |
| `needs-two-unique-verified-facts` | The event does not yet have enough distinct facts for a publishable draft. | Evidence Engine |
| `needs-clean-single-event-identity` | Sources or fragments may describe different events. | Event Clustering / Story Curator |
| `mixed-event-sources-rejected` | The dossier correctly rejected contaminated source fragments. | Story Curator / Sub-Dossier |
| `needs-clear-actor-action-event` | The canonical "who did what" is not strong enough. | Dossier Builder |

The current low viability is mostly caused by insufficient promotion of usable evidence into the dossier. Many records have source leads, but not enough same-event facts, source depth, actor/action clarity, or context to become Writer-ready.

### Important Pattern

The system is correctly refusing to write some weak articles. That is good. The failure is that those weak dossiers can remain in recovery instead of being actively enriched, split, or retired with a learning record.

Current behavior risks:

```text
Needs enrichment
  -> waits
  -> retry
  -> waits
  -> duplicate recovery
  -> no public article
```

Target behavior:

```text
Needs enrichment
  -> assign owner
  -> collect missing source/context
  -> rebuild same dossier revision
  -> retest readiness
  -> either write, publish as developing brief, or retire with prevention lesson
```

## Question 3 - Is The Writer Being Invoked Before The Dossier Reaches Sufficient Completeness?

The intended rule exists in the code: the Writer should not consume RSS directly and should only draft from a completed locked Story Dossier.

However, enforcement appears distributed across several paths. That creates bypass risk in lighter paths such as:

- pre-editor repair candidates,
- worker slice candidates,
- thin-body survivors,
- developing brief lanes,
- rescued/recovered stories,
- headline repair paths,
- older current-shelf items being refreshed.

The presence of strong rules does not prove the rule is enforced at every Writer entry point.

### Required Fix

There should be one Writer entry point:

```text
writeArticleFromLockedDossier(lockedDossier, writerReasoningPlan)
```

Every other path must call that function or fail closed.

If a story has a thin body but useful identity, it should not vanish. It should become:

```text
needs-dossier-evidence
```

and return to Evidence/Dossier expansion.

If it has enough evidence for a developing brief, it should explicitly enter:

```text
READY_FOR_DEVELOPING_BRIEF
```

and use a brief-specific Writer Reasoning plan.

## Question 4 - Are Dossiers Being Rebuilt Multiple Times?

The recovery queue and lifecycle traces indicate that dossier recovery is active and that the same event IDs can reappear across recovery records. This is useful, but it also means the system needs a clean rebuild accounting model.

The issue is not that rebuilding is always bad. A dossier should be rebuilt when new evidence arrives or when mixed-event contamination is discovered.

The issue is unmeasured rebuilding. Without rebuild counts by event ID, the Framework cannot distinguish:

- useful enrichment,
- duplicate work,
- repeated failed repair,
- source churn,
- stale recovery loops,
- category-worker starvation,
- or evidence that should have been retired.

### Required Dossier Rebuild Metrics

Every dossier should carry:

```json
{
  "storyId": "",
  "eventId": "",
  "dossierBuildCount": 1,
  "dossierRebuildCount": 0,
  "lastBuildReason": "initial-cluster",
  "lastRebuildReason": "",
  "lastBlocker": "",
  "readinessTier": "",
  "readyForWriter": false,
  "sourceContextSignals": 0,
  "verifiedFactCount": 0,
  "singleEventConfidence": 0,
  "semanticCategoryConfidence": 0,
  "writerHandoffAttempts": 0,
  "writerBypassBlocked": 0
}
```

## Dossier Efficiency Score

Production Intelligence should calculate a Dossier Efficiency Score per cycle.

```text
Dossier Efficiency =
  eligible story clusters becoming locked dossiers
  - repeated dossier rebuild penalty
  - source-context blocker penalty
  - mixed-event penalty
  - writer-bypass penalty
```

Recommended dashboard metrics:

| Metric | Target |
| --- | ---: |
| Collected leads -> event clusters | Track by tab |
| Event clusters -> sub-dossiers | > 85% |
| Sub-dossiers -> main dossiers | > 75% |
| Main dossiers -> Writer-ready | > 70% |
| Writer-ready -> first-pass draft | > 95% |
| Dossier rebuilds per public article | < 0.5 |
| Repeated `needs-source-context` events | Down 75% |
| Story identity mismatch after handoff | Near 0 |
| Writer direct RSS/thin-fragment bypasses | 0 |

## Root Cause Map

| Symptom | Likely Dossier Cause | Required Prevention |
| --- | --- | --- |
| Headline word salad | Headline built from fragments instead of actor/action/consequence. | Headline Dossier generated after locked Story Dossier. |
| Headline/lead mismatch | Headline and lead consumed different event fragments. | Both must read the same canonical event identity. |
| Missing reporting context | Dossier lacked source depth or background facts. | `needs-source-context` must route to Evidence expansion. |
| Body too short | Writer received too few verified facts. | Do not write standard article without minimum fact count. |
| Mixed topic paragraphs | Cluster contained multiple events. | Sub-dossier and main dossier must reject keyword-only overlap. |
| Wrong tab/category | Category came from collector/feed hint. | Final category assigned after canonical event dossier. |
| Image mismatch | Image selected from broad keywords, not event brief. | Image Dossier must consume canonical event, entities, category, and disallowed visuals. |
| Repair loop | Repair fixes symptom while dossier remains weak. | Route evidence-depth and identity failures upstream before repair. |

## Required State Machine

The dossier must become a state machine, not just a JSON document.

```text
collected
  -> source-normalized
  -> sub-dossier-created
  -> event-clustered
  -> evidence-expanded
  -> context-expanded
  -> canonical-event-built
  -> dossier-validated
  -> ready-for-developing-brief OR ready-for-standard-article OR hold-for-evidence
  -> locked
  -> writer-handoff
  -> writing
  -> editorial
  -> publish OR update OR recovery
```

No Writer, Headline, Image, Newsletter, or Creator Desk output should consume a dossier before `locked`.

## Sub-Dossier Requirement

Sub-dossiers should pre-separate source material before it reaches the main Story Dossier.

Each sub-dossier should classify source fragments as:

- writing evidence,
- verification evidence,
- background context,
- review-only material,
- keyword-only rejected material,
- mixed-topic rejected material.

The main Story Dossier still does the heavy organizing, but it should receive pre-separated evidence rather than raw source fragments.

This reduces:

- paragraph topic contamination,
- wrong-tab placement,
- headline/source mismatch,
- duplicate dossier rebuilding,
- thin Writer input,
- and keyword-only article construction.

## Work Orders

### Work Order 1 - Canonical Completion Contract

Create one function that all paths must use:

```text
evaluateDossierCompletion(storyDossier)
```

It returns:

```json
{
  "readyForWriter": false,
  "readinessTier": "HOLD_FOR_EVIDENCE",
  "blockingReasons": [],
  "missingEvidence": [],
  "allowedNextActions": [],
  "writerHandoffAllowed": false
}
```

### Work Order 2 - Single Writer Handoff

Make every Writer path call:

```text
handoffLockedDossierToWriter()
```

Any route that attempts to draft from RSS, source snippets, partial summaries, or thin repair candidates should be blocked and counted as `writerBypassBlocked`.

### Work Order 3 - Active Evidence Recovery

When a story fails `needs-source-context`, the system should not wait passively. It should create an evidence task:

```text
collect-primary-or-independent-source-evidence
```

with a retry deadline, owner subsystem, and success/failure outcome.

### Work Order 4 - Rebuild Accounting

Track `dossierBuildCount` and `dossierRebuildCount` by `eventId`, and record why each rebuild occurred.

### Work Order 5 - Ready Brief Lane

If a story has enough evidence for a developing brief but not a standard article, route it intentionally:

```text
READY_FOR_DEVELOPING_BRIEF
```

Do not let it become a weak standard article or disappear from the repair queue.

### Work Order 6 - Dossier-To-Public Funnel

Owner Desk should show:

```text
Collected Leads
  -> Event Clusters
  -> Sub-Dossiers
  -> Main Dossiers
  -> Writer-Ready Locked Dossiers
  -> Drafts
  -> First-Pass Approved
  -> Published Visible
```

Each drop must show the top blocker and owner subsystem.

## Actionable Learning Rule

Every dossier failure should teach prevention, not only repair.

Example:

```text
Problem:
needs-source-context

Immediate fix:
Return to Evidence Engine and gather source context.

Prevention:
Future similar stories cannot reach Writer until source-context signals are above threshold.

Upstream teaching:
Collector should prioritize primary or independent same-event sources.

Downstream teaching:
Writer must reject handoff when source-context proof is missing.
```

## Priority Conclusion

The next highest-leverage fix is not another Writer repair. It is making Story Dossier completion authoritative.

The system should not ask:

```text
Can the Writer make this usable?
```

It should ask:

```text
Has the Dossier proven this is one clean, sourced, sufficiently understood event?
```

Only then should writing begin.

If this Project 2 work is implemented, expected improvements are:

- fewer headline/lead/body mismatches,
- fewer missing-context rejections,
- fewer body-too-short failures,
- fewer wrong-tab articles,
- fewer image mismatches,
- lower repair loops per article,
- higher first-pass publication rate,
- and lower CPU per public article because downstream repair work decreases.
