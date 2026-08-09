# AI Framework Operating System

This document defines the next architecture layer for Censored Expressions. News Lab is the first major application built on the Framework. It is not the Framework itself.

## Primary Objective

Produce the highest-quality public output with the fewest possible computational steps.

For News Lab, that means a verified, visible public article. For Creator Desk, it means an original editorial. For Newsletter, it means a coherent issue. For future products, the output may be different, but the operating sequence remains the same.

## Operating Sequence

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

Each application plugs into this sequence through an adapter. The Framework OS provides the reusable intelligence, memory, governance, and optimization layers.

Coordination is the traffic-control layer. It decides which subsystem acts, which subsystem waits, which subsystem owns an issue, whether another subsystem is already solving it, and whether a shared upstream cause should suppress duplicate downstream patches.

## Framework OS Layers

| Layer | Responsibility | News Lab Example |
| --- | --- | --- |
| Input | Gather signals without treating them as final truth. | RSS, NewsData, collector workers, source reads, market feeds. |
| Knowledge | Convert inputs into structured knowledge objects. | Story Dossier, sub-dossiers, source registry, knowledge graph, image dossier. |
| Understanding | Determine what the evidence means before decisions are made. | Story Understanding answers what happened, who acted, what changed, why it matters, what is unknown, what could be misunderstood, what evidence supports each claim, and what must not be inferred. |
| Reasoning | Decide what follows from understanding before execution. | Writer Reasoning plan, decision graph, attribution plan, paragraph plan, headline inputs, repair route. |
| Coordination | Route work through one Framework workflow instead of many independent pipelines. | Decide whether Collector, Dossier, Writer, Image Worker, Publisher, or Repair Intelligence owns the next action. |
| Execution | Produce the application output from approved reasoning. | Article body, headline, image selection, Creator Desk post, newsletter section. |
| Verification | Test output against standards before and after release. | Editor, validator, image license guard, public API visibility check. |
| Optimization | Reduce unnecessary work while preserving quality. | Production Intelligence, CPU per visible article, repair loops/article. |
| Learning | Distill reusable knowledge, behavior changes, and prevention rules. | Writing patterns, failure classes, reasoning memory, learner lexicon. |
| Governance | Control permissions, owner approval, rollback, proof logs, and safe execution. | Patch proposals, action logs, subsystem readiness, deployment proof. |

## Framework Core vs Applications

| Area | Framework Core | Application Adapter |
| --- | --- | --- |
| Purpose | General governed AI production system. | Product-specific implementation. |
| Owns | Memory, learning, reasoning, governance, optimization, verification patterns. | Routes, UI, data files, public surfaces, domain-specific workflows. |
| Examples | Production Intelligence, Reasoning Memory Graph, Knowledge Distillation, Governance Engine. | News Lab, Creator Desk, Newsletter, Market Pulse, Merch. |
| Portability | Reusable across future companies or applications. | Replaceable or extendable per product. |

The Core should not depend on a single website page, content type, or data layout. The adapter translates product needs into Framework OS tasks.

## Framework Coordinator

The Framework Coordinator is the missing operating layer between Reasoning and Execution.

It owns these decisions:

- Which subsystem should act next.
- Which subsystem should wait because another layer is resolving the shared cause.
- Whether a failure is isolated or shared across multiple applications/subsystems.
- Whether an issue belongs to the Framework Core or an application adapter.
- Whether the canonical knowledge object is ready for execution.
- Whether repair is safe, whether evidence is missing, or whether owner approval is required.
- Whether the current work should continue, pause, merge, update, or be abandoned.

The Coordinator prevents the Framework from becoming a collection of independent brains. Production Intelligence, Writer Reasoning, Editorial Intelligence, Image Intelligence, Repair Intelligence, and Diagnostic Intelligence remain reasoning modules. They do not independently own the whole workflow.

```text
Framework Coordinator
  -> receives signals from reasoning modules
  -> identifies shared or isolated cause
  -> assigns owner subsystem
  -> checks governance boundary
  -> authorizes execution or hold
  -> sends outcome to verification, optimization, and learning
```

## Unified Workflow Rule

There should be one Framework workflow. Applications may adapt it, but they should not create competing workflows.

```text
Application Adapter
  -> Framework Coordinator
  -> Input
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

News Lab, Creator Desk, Newsletter, Market Pulse, Sports Intelligence, and future products should plug into this same sequence. Application-specific workers should only collect, transform, or render application data. They should not own Framework memory, governance, learning, diagnostics, optimization, or root-cause policy.

## News Lab As An Application

News Lab should consume Framework OS services rather than reimplement them independently.

```text
News Lab Adapter
  -> Input: collectors and source leads
  -> Knowledge: Story Dossier and Image Dossier
  -> Understanding: Story Understanding
  -> Reasoning: Writer Reasoning Plan
  -> Coordination: Framework Coordinator assigns next owner and prevents duplicate patching
  -> Execution: article body, headline, image
  -> Verification: editor, validator, public visibility
  -> Optimization: production efficiency
  -> Learning: article/craft/failure lessons
  -> Governance: owner approval and proof logs
```

The Story Dossier is the application knowledge object. Story Understanding is the meaning layer produced from that dossier. Together they must become the source of truth for Writer, Headline Generator, Editor, Image Intelligence, Newsletter, Creator Desk, Search, Owner Desk, analytics, and future applications.

The canonical event is more important than the article. Articles, newsletters, creator posts, images, alerts, search results, analytics, and updates are outputs created from the same canonical event dossier and its Story Understanding object.

See `AI_FRAMEWORK_PHASE_3_STORY_DOSSIER_ENGINE.md` for the Story Dossier Engine contract. It defines evidence intake, normalization, entity extraction, event detection, evidence clustering, canonical story building, readiness gates, recovery, version history, and dossier memory.

See `AI_FRAMEWORK_PHASE_4_WRITER_REASONING_ENGINE.md` for the Writer Reasoning Engine contract. It defines the pre-writing cognitive layer that converts a locked Story Dossier into a reasoning graph, evidence map, narrative blueprint, paragraph plan, attribution plan, headline reasoning, and verified writing outline.

See `AI_FRAMEWORK_PHASE_5_EDITORIAL_INTELLIGENCE_ENGINE.md` for the Editorial Intelligence Engine contract. It defines the continuously learning quality system that predicts approval, detects issues, plans targeted repair, verifies improvements, stores editorial memory, and prevents repeated failures.

See `AI_FRAMEWORK_PHASE_6_PRODUCTION_INTELLIGENCE_EFFICIENCY_AUDIT.md` for the Production Intelligence and Operational Efficiency audit. It defines efficiency per public output, value conversion rates, CPU/memory/API/file-read cost per visible article, repair-loop targets, knowledge efficiency, reasoning usefulness, and daily bounded optimization reporting.

See `AI_FRAMEWORK_PHASE_7_LEARNING_ARCHITECTURE.md` for the governed Learning Architecture. It defines Search Learning, Article Memory, Operational Memory, Adaptive Learning, Diagnostic Learning, Pattern Learning, Capability Promotion, knowledge distillation, learning constraints, and promotion rules.

See `AI_FRAMEWORK_PHASE_8_FRAMEWORK_GOVERNANCE_MANUAL.md` for the Framework Governance Manual. It defines authority, trust levels, permissions, owner approval, bounded execution, rollback, verification, audit, risk assessment, change management, learning governance, incident response, and governance metrics.

See `AI_FRAMEWORK_PHASE_9_IMAGE_INTELLIGENCE_ENGINE.md` for the Image Intelligence Engine. It defines visual intent extraction, source routing, provider adapters, image context verification, licensing intelligence, image ranking, confidence scoring, AI-image governance, accessibility, Image Dossiers, and post-publication image repair.

See `AI_FRAMEWORK_PHASE_10_PERFORMANCE_ENGINEERING.md` for the Performance Engineering guide. It defines CPU, memory, I/O, cache, payload, JSON, API, worker, synchronization, database, compression, large-file, benchmarking, monitoring, and self-optimization standards.

See `AI_FRAMEWORK_PHASE_11_COMMERCIALIZATION.md` for the Commercialization plan. It defines deployment models, multi-tenancy, licensing, SaaS operations, onboarding, industry adaptation, pricing, security, integrations, customer success, marketplace, and business operations.

See `AI_FRAMEWORK_PHASE_12_PATENT_IP_PORTFOLIO.md` for the Patent and Intellectual Property Portfolio. It defines invention detection, master invention registers, disclosure packages, trade-secret tracking, claim strategy, prior-art logs, implementation evidence archives, provisional filing packages, and IP commercialization strategy.

See `AI_FRAMEWORK_PHASE_13_FRAMEWORK_OS_INTEGRATION.md` for the Framework OS Integration plan. It defines Project 13 as the system integrator, with shared engines, standard project lifecycle, cross-project contracts, framework-wide metrics, integration gates, release gates, application adapters, and the integration-first rule.

See `AI_FRAMEWORK_OPERATIONAL_EFFICIENCY_AUDIT.md` for the code-driven Operational Efficiency Audit. It identifies oversized active state, repeated JSON/file work, sync serialization pressure, dead direct-build code, repair queue growth, dossier-to-writer enforcement gaps, category enforcement gaps, and prioritized efficiency work orders.

See `AI_FRAMEWORK_DOSSIER_EFFICIENCY_REPORT.md` for the Project 2 Dossier Efficiency Report. It audits when dossiers are considered complete, why collected stories fail to become viable dossiers, whether Writer paths can bypass sufficient dossier readiness, how dossier rebuilds should be measured, and how the Story Dossier should become an authoritative state machine before writing begins.

## V2 Capability Priorities

| Capability | Current Direction | Target Behavior |
| --- | --- | --- |
| Writer Reasoning | Often measured after drafting or inconsistently applied in lighter paths. | Always runs before prose. Blocks writing when actor, action, facts, uncertainty, attribution, paragraph plan, or headline inputs are missing. |
| Story Dossier | Strong concept, uneven readiness and sometimes incomplete evidence. | Locked, validated, semantically classified, and stable before writing begins. |
| Story Understanding | Newly formalized between Knowledge and Reasoning. | Converts the locked dossier into meaning answers, evidence maps, misunderstanding risks, prohibited inferences, headline/lead emphasis, and background boundaries before reasoning begins. |
| Root Cause Intelligence | Can detect subsystem weakness but may patch symptoms independently. | Detects shared upstream causes and creates one higher-leverage proposal before isolated subsystem patches. |
| Category Intelligence | Collector/feed category can bias output. | Source and collector categories are hints; final category comes from the canonical event after dossier completion. |
| Image Intelligence | Image work can be delayed or treated as optional. | Image Dossier, license verification, provider ranking, generated fallback, and post-publication safe image repair. |
| Publication Efficiency | Counts and blockers exist, but optimization must be central. | Measures CPU, memory, latency, repair loops, first-pass approval, recovered approval, and verified-visible publication. |

## Production Intelligence Mandate

Production Intelligence is the Framework OS optimizer. It sits above applications, not inside News Lab. It answers:

```text
What prevented a high-quality first-pass public output?
Where did useful work stop becoming visible value?
Which shared upstream cause explains multiple downstream symptoms?
What one bounded improvement should be tested next?
```

It should measure:

- Collection efficiency.
- Cluster efficiency.
- Dossier efficiency.
- Reasoning efficiency.
- Writing efficiency.
- Headline efficiency.
- Editorial efficiency.
- Repair efficiency.
- Publication efficiency.
- CPU per visible public article.
- Memory per visible public article.
- Repair loops per article.
- Average reasoning completeness.
- Average dossier completeness.
- Publication latency.
- First-pass publication rate.
- Recovered publication rate.

The goal is not maximum processing. The goal is maximum verified public value per unit of work.

Production Intelligence should optimize the Framework workflow itself:

- Detect unnecessary work.
- Identify the earliest shared failure layer.
- Suppress duplicate subsystem patches when a shared root cause exists.
- Recommend one bounded intervention.
- Measure whether the intervention improved public value per unit of work.

## Governance Rule

Subsystems may observe, diagnose, propose, repair within assigned bounds, and learn. They do not outrank the Framework OS.

The Framework OS decides:

- What the application is trying to produce.
- Which knowledge object is authoritative.
- Whether reasoning is complete.
- Whether execution is allowed.
- Whether verification passed.
- Whether optimization should change behavior.
- Whether learning becomes permanent memory.
- Whether owner approval is required.

## V3 Consolidation Roadmap

Version 3 should focus on architectural consolidation rather than adding many new subsystems.

```text
Production Intelligence
  -> Framework Coordinator
  -> Unified Workflow
  -> Reasoning First
  -> Shared Memory
  -> Canonical Dossier
  -> Application Adapters
```

The consolidation goal is to move ownership out of News Lab and into Framework Core services:

| Current Drift | Target Ownership |
| --- | --- |
| News Lab owns learning behavior. | Learning Engine owns learning; News Lab contributes examples. |
| News Lab owns optimization. | Production Intelligence owns optimization across all applications. |
| News Lab owns diagnostics. | Diagnostic/Verification Engine owns diagnostics. |
| Repair logic acts as its own workflow. | Coordinator routes repair through the unified workflow. |
| Dossier supports articles. | Canonical Dossier powers all downstream outputs. |
| Multiple intelligence modules behave independently. | Brain coordinates reasoning modules through one workflow. |

## Architectural Direction

The long-term codebase should move from one large application file toward reusable domain-neutral services:

- Dossier Engine.
- Framework Coordinator.
- Workflow Engine.
- Reasoning Engine.
- Learning Engine.
- Governance Engine.
- Verification Engine.
- Production Intelligence Engine.
- Publication Adapter.
- Storage Adapter.
- Application Adapters.

Extraction should be gradual. Each extraction must preserve current site behavior, public publication, owner access, data compatibility, and rollback safety.

## IP/Commercial Position

The strongest invention is not an AI news site. It is a governed AI production framework that can:

1. Ingest inputs.
2. Build structured knowledge.
3. Reason before executing.
4. Produce application-specific outputs.
5. Verify against standards.
6. Optimize computational work.
7. Learn reusable behaviors.
8. Govern execution with proof and approval.

News Lab proves the pattern in a high-pressure public content environment. The Framework OS is the reusable platform.
