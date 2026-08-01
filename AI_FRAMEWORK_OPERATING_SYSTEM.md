# AI Framework Operating System

This document defines the next architecture layer for Censored Expressions. News Lab is the first major application built on the Framework. It is not the Framework itself.

## Primary Objective

Produce the highest-quality public output with the fewest possible computational steps.

For News Lab, that means a verified, visible public article. For Creator Desk, it means an original editorial. For Newsletter, it means a coherent issue. For future products, the output may be different, but the operating sequence remains the same.

## Operating Sequence

```text
Input
  -> Knowledge
  -> Reasoning
  -> Execution
  -> Verification
  -> Optimization
  -> Learning
  -> Governance
```

Each application plugs into this sequence through an adapter. The Framework OS provides the reusable intelligence, memory, governance, and optimization layers.

## Framework OS Layers

| Layer | Responsibility | News Lab Example |
| --- | --- | --- |
| Input | Gather signals without treating them as final truth. | RSS, NewsData, collector workers, source reads, market feeds. |
| Knowledge | Convert inputs into structured knowledge objects. | Story Dossier, sub-dossiers, source registry, knowledge graph, image dossier. |
| Reasoning | Decide what the knowledge means before execution. | Canonical event, verified facts, unknown facts, attribution plan, headline inputs. |
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

## News Lab As An Application

News Lab should consume Framework OS services rather than reimplement them independently.

```text
News Lab Adapter
  -> Input: collectors and source leads
  -> Knowledge: Story Dossier and Image Dossier
  -> Reasoning: Writer Reasoning Plan
  -> Execution: article body, headline, image
  -> Verification: editor, validator, public visibility
  -> Optimization: production efficiency
  -> Learning: article/craft/failure lessons
  -> Governance: owner approval and proof logs
```

The Story Dossier is the application knowledge object. It must become the single source of truth for Writer, Headline Generator, Editor, Image Intelligence, Newsletter, Creator Desk, Search, Owner Desk, analytics, and future applications.

## V2 Capability Priorities

| Capability | Current Direction | Target Behavior |
| --- | --- | --- |
| Writer Reasoning | Often measured after drafting or inconsistently applied in lighter paths. | Always runs before prose. Blocks writing when actor, action, facts, uncertainty, attribution, paragraph plan, or headline inputs are missing. |
| Story Dossier | Strong concept, uneven readiness and sometimes incomplete evidence. | Locked, validated, semantically classified, and stable before writing begins. |
| Root Cause Intelligence | Can detect subsystem weakness but may patch symptoms independently. | Detects shared upstream causes and creates one higher-leverage proposal before isolated subsystem patches. |
| Category Intelligence | Collector/feed category can bias output. | Source and collector categories are hints; final category comes from the canonical event after dossier completion. |
| Image Intelligence | Image work can be delayed or treated as optional. | Image Dossier, license verification, provider ranking, generated fallback, and post-publication safe image repair. |
| Publication Efficiency | Counts and blockers exist, but optimization must be central. | Measures CPU, memory, latency, repair loops, first-pass approval, recovered approval, and verified-visible publication. |

## Production Intelligence Mandate

Production Intelligence is the Framework OS optimizer. It answers:

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

## Architectural Direction

The long-term codebase should move from one large application file toward reusable domain-neutral services:

- Dossier Engine.
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
