# AI Framework Intelligence Architecture

This document defines the next maturity layer for the Censored Expressions AI Framework. The goal is to improve the quality of Framework decisions, not simply add more subsystems.

## Core Direction

The Framework should operate as an intelligence layer that can observe, compare, decide, execute within approved boundaries, verify, and learn. Each intelligence lane must produce measurable evidence so the Brain can determine whether its decisions are getting smarter over time.

## Intelligence Lanes

| Lane | Purpose | Measures | Expected Decision Improvement |
| --- | --- | --- | --- |
| Editorial Intelligence | Produce original, topic-specific writing that connects facts and commentary naturally. | Topic match, repetition count, editor findings, source-fact coverage, remedy specificity, owner-feedback recurrence. | Creator Desk editorials become less generic, less repetitive, and more clearly tied to the selected facts. |
| Feed Intelligence | Track per-source health, attribution, adaptive polling, quarantine, cache fallback, and source-specific recovery. | Error count by URL/domain/provider, slow-source events, cache-hit rate, quarantine count, refresh latency, recovery rate. | Feed Reliability stops treating feed health as one aggregate issue and makes targeted source-level decisions. |
| News Lab Intelligence | Compare source coverage, detect agreement and contradiction, build timelines, score confidence, and update stories as evidence changes. | Source count, agreement ratio, contradiction count, timeline event count, confidence score, article completeness score. | News Lab becomes an intelligence workspace that creates fact-based CE Media stories from cross-source reporting. |
| Predictive Brain | Forecast degrading site or Framework conditions before they become visible failures. | Trend delta, repeated early warnings, latency slope, readiness drop, stale cache age, source instability, content-quality regression. | The Brain moves from reactive repair to proactive prevention. |
| Cross-Application Framework | Separate Framework Core from site-specific adapters so the same Brain can manage other applications or business systems. | Adapter count, reusable engine coverage, app-specific dependency map, governance boundary clarity, portable lesson count. | The Framework becomes a reusable orchestration platform instead of a site-only feature. |

## Framework Core vs Application Adapters

The Framework should be separated into two conceptual layers:

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Framework Core | Learning, memory, scoring, diagnostics, governance, patch approval, proof logs, subsystem management, predictive analysis, decision quality. | Confidence Engine, Feed Intelligence, Editorial Intelligence, Patch Structuring, Predictive Brain. |
| Application Adapter | App-specific files, routes, data models, content lanes, visual surfaces, deployment rules, and business objectives. | Censored Expressions feed pages, Creator Desk, Newsletter, News Lab, merch shop, ad placements. |

The Core should never depend on a single site layout. The adapter teaches the Core what an application needs. The Core decides how to monitor, improve, and verify that application.

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
2. Decide whether the fix is runtime adjustment, content rewrite, source isolation, prediction rule, or code patch.
3. Execute bounded approved actions when safe.
4. Request owner approval for code changes or higher-risk changes.
5. Verify the result with the same metric that triggered the action.
6. Save the outcome as reusable memory for the next application.

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
