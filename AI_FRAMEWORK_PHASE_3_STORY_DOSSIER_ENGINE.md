# AI Framework Phase 3 Story Dossier Engine

Project: Censored Expressions AI Framework / News Lab V2  
Scope: Architecture and subsystem contract for the Story Dossier Engine.

## Purpose

The Story Dossier Engine transforms independent pieces of information into a single, continuously evolving representation of a real-world event.

The Framework should not remember isolated articles as its primary unit of intelligence. It should remember stories.

```text
Sources
  -> Evidence Collection
  -> Story Dossier Engine
  -> Writer Reasoning Engine
  -> Editorial Intelligence
  -> Public Output
```

The Story Dossier Engine is the central intelligence layer between information collection and article generation.

## Core Philosophy

The internet reports information.  
The Framework understands events.

The Story Dossier Engine converts fragmented reporting into structured knowledge so downstream systems do not work from isolated RSS items, publisher headlines, or disconnected source fragments.

## Primary Objectives

The engine must:

- Identify emerging stories.
- Merge duplicate reporting.
- Separate unrelated events.
- Track evolving timelines.
- Build evidence confidence.
- Recover incomplete stories.
- Preserve historical memory.
- Supply clean dossiers to writers, editors, image systems, newsletters, Creator Desk, search, and analytics.

## High-Level Architecture

```text
Incoming Sources
  -> Evidence Intake
  -> Evidence Normalization
  -> Entity Extraction
  -> Event Detection
  -> Evidence Clustering
  -> Canonical Story Builder
  -> Story Dossier
  -> Enrichment
  -> Readiness Evaluation
  -> Memory
```

## Major Components

### 1. Evidence Intake

Evidence Intake collects information from standardized source adapters:

- RSS.
- News APIs.
- Government releases.
- Court filings.
- Press releases.
- Official statements.
- Transcripts.
- Sports feeds.
- Financial feeds.
- Weather feeds.
- Social verification.
- Archived sources.

All sources must enter through one standardized intake pipeline.

### 2. Evidence Normalization

Normalization converts raw material into a consistent internal representation.

It normalizes:

- Timestamps and time zones.
- Currency.
- Units.
- Locations.
- Names and aliases.
- URLs.
- Quotations.
- Metadata.
- Language and encoding.
- Duplicate source records.

### 3. Entity Extraction

Entity Extraction identifies significant objects:

- People.
- Organizations.
- Companies.
- Governments.
- Locations.
- Events.
- Teams.
- Products.
- Laws and bills.
- Court cases.
- Diseases.
- Storms.
- Stocks.

Canonical entity model:

```json
{
  "id": "",
  "primaryName": "",
  "aliases": [],
  "type": "",
  "confidence": 0,
  "sources": [],
  "relationships": [],
  "lastUpdated": ""
}
```

### 4. Event Detection

Event Detection answers:

```text
What actually happened?
```

Instead of storing:

```text
Reuters article
AP article
CNN article
Fox article
```

the engine identifies:

```text
Single Event
  -> referenced by all four
```

Event signature:

- Who.
- What.
- When.
- Where.
- Impact.
- Status.
- Confidence.
- Evidence count.
- Affected entities.
- Temporal position.

### 5. Evidence Clustering

Evidence Clustering merges multiple reports into one event cluster.

Clustering signals:

- Similarity score.
- Named entities.
- Shared quotations.
- Location overlap.
- Timeline overlap.
- Headline similarity.
- Semantic similarity.
- Source diversity.
- Official confirmation.

The cluster should contain evidence for one event, not one keyword topic.

### 6. Canonical Story Builder

The Canonical Story Builder constructs the current official Framework representation of the event.

It maintains:

- Known facts.
- Unknown facts.
- Disputed facts.
- Confirmed timeline.
- Evidence strength.
- Missing evidence.
- Contradictions.
- Open questions.

## Story Dossier Structure

Every dossier should follow this shape:

```json
{
  "storyId": "",
  "eventId": "",
  "headlineDirection": "",
  "canonicalSummary": "",
  "currentStatus": "",
  "evidence": [],
  "timeline": [],
  "entities": [],
  "locations": [],
  "images": [],
  "quotes": [],
  "relatedStories": [],
  "confidence": {},
  "readiness": {},
  "memory": {},
  "versionHistory": []
}
```

## Timeline Construction

The dossier should not follow article order. It should build a verified event timeline:

```text
09:00 Official statement
09:14 Witness report
09:42 Police confirmation
11:05 Court filing
15:30 Governor statement
```

Each timeline item must include source, timestamp, confidence, and verification status.

## Evidence Graph

Every claim links back to evidence:

```text
Claim
  -> Supporting Evidence
  -> Source
  -> Timestamp
  -> Verification Status
```

Nothing should exist inside the dossier without traceability.

## Contradiction Engine

Contradictions become tracked objects instead of hidden edits.

The engine detects:

- Conflicting numbers.
- Changing casualty counts.
- Incorrect identities.
- False rumors.
- Retracted statements.
- Updated timelines.

Contradiction object:

```json
{
  "claimA": "",
  "claimB": "",
  "sources": [],
  "severity": "",
  "status": "unresolved",
  "resolution": "",
  "updatedAt": ""
}
```

## Confidence Model

Confidence increases through independent confirmation.

Example:

```text
One anonymous social post
  -> Very low confidence

Official police release
  -> Confidence increases

Three independent news organizations
  -> Confidence increases again

Court filing
  -> High confidence
```

Confidence factors:

- Source reliability.
- Original reporting percentage.
- Independent confirmations.
- Official evidence.
- Contradictions.
- Correction history.
- Source diversity.
- Recency and update stability.

## Story Readiness

Every dossier receives readiness scoring:

| Stage | Example Score |
| --- | ---: |
| Collection | 15% |
| Clustered | 30% |
| Entities Verified | 45% |
| Timeline Built | 60% |
| Evidence Stable | 75% |
| Writer Ready | 90% |
| Editorial Ready | 100% |

Readiness gates:

- Evidence threshold.
- Timeline threshold.
- Entity threshold.
- Contradiction threshold.
- Freshness threshold.
- Confidence threshold.

The Writer Reasoning Engine cannot consume dossiers until minimum readiness thresholds are satisfied.

## Enrichment Engine

Enrichment continuously improves dossiers with:

- Background history.
- Historical comparisons.
- Biographies.
- Previous incidents.
- Statistics.
- Maps.
- Related legislation.
- Prior court cases.
- Financial history.
- Sports statistics.
- Election history.
- Weather context.
- Economic indicators.

Enrichment should add context only when it helps readers understand the current event.

## Recovery Engine

The Recovery Engine detects incomplete dossiers and routes them back to the right upstream owner.

Common missing elements:

- Timeline.
- Source.
- Location.
- Image.
- Quote.
- Confirmation.
- Entity identity.
- Contradiction resolution.

Recovery strategies:

- Search additional trusted sources.
- Request updated feeds.
- Link related events.
- Rebuild entity graphs.
- Reconstruct timelines.
- Mark as developing when evidence is enough for a brief but not a full article.

The recovery rule:

```text
Incomplete dossier
  -> enrich or hold
  -> do not let the Writer compensate with guesses
```

## Canonical Memory

Stories never disappear as knowledge.

Each dossier becomes institutional memory:

- Original event.
- Updates.
- Corrections.
- Outcomes.
- Long-term effects.
- Related future stories.

Approved public articles may expire from active tiles, but the dossier remains available to search, historical context, and future reporting.

## Version History

Every update creates a new dossier version:

```text
Version 1
  -> Version 2
  -> Version 3
  -> Version 4
```

Every change must be explainable:

- What changed.
- Why it changed.
- Which evidence caused it.
- Whether public output needs an update.
- Whether a correction is required.

## Story Relationships

Stories are connected through long-running event structures:

```text
Election
  -> Campaign
  -> Debate
  -> Court Challenge
  -> Certification
  -> Transition
  -> Historical Archive
```

Relationship memory supports:

- Recurring people.
- Organizations.
- Locations.
- Story patterns.
- Seasonality.
- Recurring legal cases.
- Long-running investigations.
- Annual events.
- Sports seasons.
- Legislative sessions.

## Source Attribution

Every fact records:

- Origin.
- Timestamp.
- Verification status.
- Confidence.
- Supporting evidence.
- Competing evidence.

Nothing is anonymous inside the engine.

## Image Intelligence Integration

Each dossier maintains image intelligence:

- Available licensed images.
- Image confidence.
- Photographer.
- Caption.
- Rights.
- Source.
- Publication readiness.
- Generated-image fallback brief.
- Post-publication image repair status.

The Image Dossier should be derived from the Story Dossier, not from the publisher headline alone.

## Writer Interface

The Writer Reasoning Engine receives one structured knowledge package:

- Canonical summary.
- Evidence graph.
- Timeline.
- Verified facts.
- Unknowns.
- Quotes.
- Statistics.
- Context.
- Related history.
- Confidence indicators.
- Headline inputs.
- Prohibited inferences.
- Paragraph purpose plan.

The Writer should never consume raw RSS directly.

## Editorial Integration

Editorial Intelligence evaluates:

- Evidence quality.
- Contradictions.
- Readiness.
- Confidence.
- Completeness.
- Attribution.
- Risk.
- Coverage gaps.

If Editorial finds a dossier problem, the issue goes back to the Story Dossier Engine or Evidence Engine, not to a generic article rewrite.

## Learning Integration

Every published article feeds back into dossier quality assessment.

The Framework learns:

- Which evidence was useful.
- Which evidence was ignored.
- Which context was missing.
- Which facts arrived late.
- Which editorial corrections were caused by dossier weakness.
- Which recovery strategy worked.

The lesson should become a generalized dossier-building improvement, not an exact memory of one article.

## Performance Goals

The Story Dossier Engine should:

- Cluster thousands of incoming reports into canonical stories with low latency.
- Maintain full evidence traceability from every claim to every supporting source.
- Support incremental updates without rebuilding complete dossiers.
- Preserve complete version history and auditability.
- Scale across local, national, international, sports, entertainment, business, market, and weather domains.
- Deliver writer-ready dossiers that reduce redundant research while preserving uncertainty.

## Integration Within Framework OS

The Story Dossier Engine is Project 03 in the Framework maturity roadmap:

```text
Project 01 Architecture
Project 02 Production Pipeline
Project 03 Story Dossier Engine
Project 04 Writer Reasoning Engine
Project 05 Editorial Intelligence
Project 06 Production Intelligence
Project 07 Learning Architecture
Project 08 Governance
Project 09 Image Intelligence
Project 10 Performance Engineering
Project 11 Commercialization
Project 12 Patent Portfolio
Project 13 Framework OS Integration
```

## Success Criteria

A successful Story Dossier Engine ensures that the rest of the Framework never works directly from isolated articles.

Every downstream subsystem should operate from a living, evidence-backed, canonical representation of each story that:

- Evolves over time.
- Preserves provenance.
- Tracks uncertainty explicitly.
- Records contradictions.
- Supports recovery.
- Supplies clean writer-ready knowledge.
- Accumulates organizational memory.

This establishes the dossier as the authoritative source of truth for writing, editing, imaging, search, learning, and long-term story memory.
