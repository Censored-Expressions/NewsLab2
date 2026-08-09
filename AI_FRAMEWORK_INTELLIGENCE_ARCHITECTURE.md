# AI Framework Intelligence Architecture

This document defines the next maturity layer for the Censored Expressions AI Framework. The goal is to improve the quality of Framework decisions, not simply add more subsystems.

## Core Direction

The Framework should operate as an intelligence layer that can observe, compare, decide, execute within approved boundaries, verify, and learn. Each intelligence lane must produce measurable evidence so the Brain can determine whether its decisions are getting smarter over time.

The next architecture layer is the **Framework Operating System**. News Lab, Creator Desk, Newsletter, Market Pulse, and future products should be treated as applications running on the Framework OS, not as the Framework itself.

```text
Input
  -> Knowledge
  -> Understanding
  -> Reasoning
  -> Coordination
  -> Execution
  -> Verification
  -> Optimization
  -> Learning
  -> Governance
```

See `AI_FRAMEWORK_OPERATING_SYSTEM.md` for the operating model, Framework Coordinator, V2 capability priorities, Production Intelligence mandate, and Framework Core vs Application Adapter boundary.

The key Version 3 architectural correction is that intelligence modules should not become independent brains. They are reasoning modules coordinated by the Framework Coordinator.

## Intelligence Lanes

| Lane | Purpose | Measures | Expected Decision Improvement |
| --- | --- | --- | --- |
| Editorial Intelligence | Produce original, topic-specific writing that connects facts and commentary naturally. | Topic match, repetition count, editor findings, source-fact coverage, remedy specificity, owner-feedback recurrence. | Creator Desk editorials become less generic, less repetitive, and more clearly tied to the selected facts. |
| Feed Intelligence | Track per-source health, attribution, adaptive polling, quarantine, cache fallback, and source-specific recovery. | Error count by URL/domain/provider, slow-source events, cache-hit rate, quarantine count, refresh latency, recovery rate. | Feed Reliability stops treating feed health as one aggregate issue and makes targeted source-level decisions. |
| News Lab Intelligence | Compare source coverage, detect agreement and contradiction, build timelines, score confidence, and update stories as evidence changes. | Source count, agreement ratio, contradiction count, timeline event count, confidence score, article completeness score. | News Lab becomes an intelligence workspace that creates fact-based CE Media stories from cross-source reporting. |
| Understanding Intelligence | Convert canonical knowledge objects into meaning objects before reasoning or execution. | Understanding readiness, evidence-to-answer coverage, prohibited-inference coverage, misunderstanding risks, headline/lead emphasis alignment. | Writer Reasoning, Image Intelligence, Newsletter, and Creator Desk stop reconstructing meaning independently and consume the same validated understanding. |
| Production Intelligence | Optimize the production process itself by finding where useful work stops becoming verified public output. | CPU per visible article, memory per visible article, repair loops/article, first-pass publication rate, recovered publication rate, publication latency, weakest stage. | The Brain improves output quality and speed by reducing unnecessary work instead of simply processing more candidates. |
| Root Cause Intelligence | Detect shared upstream causes across multiple weak subsystems before creating isolated fixes. | Shared failure signatures, affected subsystem count, earliest failing layer, duplicate patch suppression, verified downstream improvement. | Business, Technology, Politics, or other lanes stop receiving separate patches when one shared intake/dossier/verification cause explains the weakness. |
| Framework Coordinator | Decide ownership, sequencing, waiting, repair routing, and shared-cause suppression across every application. | Orphaned tasks, duplicate proposals suppressed, issue owner clarity, cross-subsystem wait states, governance handoff count, workflow completion rate. | The Brain stops letting multiple systems run competing workflows and routes every issue through one operating sequence. |
| Predictive Brain | Forecast degrading site or Framework conditions before they become visible failures. | Trend delta, repeated early warnings, latency slope, readiness drop, stale cache age, source instability, content-quality regression. | The Brain moves from reactive repair to proactive prevention. |
| Cross-Application Framework | Separate Framework Core from site-specific adapters so the same Brain can manage other applications or business systems. | Adapter count, reusable engine coverage, app-specific dependency map, governance boundary clarity, portable lesson count. | The Framework becomes a reusable orchestration platform instead of a site-only feature. |

## Framework Core vs Application Adapters

The Framework should be separated into two conceptual layers:

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Framework Core | Learning, memory, scoring, diagnostics, governance, patch approval, proof logs, subsystem management, predictive analysis, decision quality. | Confidence Engine, Feed Intelligence, Editorial Intelligence, Patch Structuring, Predictive Brain. |
| Application Adapter | App-specific files, routes, data models, content lanes, visual surfaces, deployment rules, and business objectives. | Censored Expressions feed pages, Creator Desk, Newsletter, News Lab, merch shop, ad placements. |

The Core should never depend on a single site layout. The adapter teaches the Core what an application needs. The Core decides how to monitor, improve, and verify that application.

## Coordination Rule

Every intelligence lane must report its finding to the Framework Coordinator before execution. The Coordinator decides:

1. Whether the issue is isolated or shared.
2. Whether the issue belongs to Framework Core or an application adapter.
3. Which subsystem owns the next action.
4. Which subsystem should wait.
5. Whether repair, enrichment, verification, optimization, learning, or owner approval is required.
6. Whether the action should affect one application or become a reusable Framework capability.

This keeps Production Intelligence, Writer Reasoning, Editorial Intelligence, Image Intelligence, Repair Intelligence, and Diagnostic Intelligence from becoming separate workflows.

## Canonical Knowledge Object Rule

The canonical event dossier is the center of application intelligence.

For News Lab, the Story Dossier should feed:

- Story Understanding.
- Writer.
- Headline Generator.
- Publishing Editor.
- Validator.
- Image Dossier.
- Newsletter.
- Creator Desk.
- Search.
- Owner Desk.
- Analytics.
- Future recommendations and alerts.

The article is an output. The dossier is the source of truth. Story Understanding is the bridge that explains what the dossier means before any downstream reasoning or execution begins.

## Decision Quality Metrics

Every intelligence lane should report:

- `currentScore`: current lane readiness or quality score.
- `trend`: improving, stable, declining, or unknown.
- `evidence`: concrete measurements that explain the score.
- `decision`: what the Brain chose to do.
- `expectedBenefit`: the measurable improvement expected.
- `verification`: how the Brain will prove the change worked.
- `nextAction`: the next bounded action or patch request.

## Operating Rule

When the Brain sees a weak score, it should not only record the issue. It should:

1. Identify the exact lane and failing evidence.
2. Send the issue through the Framework Coordinator.
3. Decide whether the fix is runtime adjustment, content rewrite, source isolation, prediction rule, code patch, or application-adapter change.
4. Execute bounded approved actions when safe.
5. Request owner approval for code changes or higher-risk changes.
6. Verify the result with the same metric that triggered the action.
7. Save the outcome as reusable memory for the next application.

## Commercial/IP Direction

The differentiator is not that the website has many subsystems. The differentiator is that the Framework can manage a business application through measurable intelligence lanes, controlled execution, proof logs, governance, and reusable adapters.

That makes the system easier to explain to future partners:

```text
Business application
  -> application adapter
  -> Framework Core
  -> intelligence lanes
  -> governed decision
  -> approved execution
  -> verified result
  -> reusable memory
```

The Framework should keep evolving toward that model.
