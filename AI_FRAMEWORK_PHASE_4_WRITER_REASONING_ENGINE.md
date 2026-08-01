# AI Framework Phase 4 Writer Reasoning Engine

Project: Censored Expressions AI Framework / News Lab V2  
Scope: Architecture and subsystem contract for the Writer Reasoning Engine.

## Purpose

The Writer Reasoning Engine thinks before writing.

It does not generate public language immediately. It builds an internal reasoning model that explains:

- What happened.
- Why it matters.
- What is verified.
- What remains uncertain.
- How information should be organized.
- Which evidence supports every statement.
- How confidence changes throughout the article.

The output is not an article. The output is a reasoning model that guides article generation.

## Core Principle

The Writer never begins with:

```text
What should I write?
```

It begins with:

```text
What is the most defensible explanation supported by available evidence?
```

## Primary Objectives

The Writer Reasoning Engine must:

- Maximize factual accuracy.
- Reduce hallucinations.
- Improve article consistency.
- Improve attribution.
- Improve readability.
- Produce repeatable reasoning.
- Expose uncertainty.
- Explain why every paragraph exists.
- Justify every headline.

## Overall Architecture

```text
Incoming Story Dossier
  -> Story Understanding
  -> Reasoning Construction
  -> Evidence Mapping
  -> Narrative Planning
  -> Paragraph Planning
  -> Headline Reasoning
  -> Verification
  -> Writer
```

The Writer Reasoning Engine consumes completed Story Dossiers. It must never consume raw RSS directly.

## Module 1 - Story Understanding

Purpose: understand the story before attempting language generation.

Tasks:

- Identify subject.
- Identify primary event.
- Identify secondary events.
- Identify timeline.
- Identify location.
- Identify organizations.
- Identify individuals.
- Identify actions.
- Identify outcomes.
- Identify conflicts.
- Identify significance.

Output:

```json
{
  "primaryEvent": "",
  "secondaryEvents": [],
  "background": [],
  "timeline": [],
  "stakeholders": [],
  "impacts": [],
  "openQuestions": []
}
```

## Module 2 - Reasoning Graph

The engine constructs a graph instead of relying on linear prompting.

```text
Claim
  -> Evidence
  -> Supporting Sources
  -> Confidence
  -> Potential Counterpoints
  -> Open Questions
```

Each node contains:

- Statement.
- Supporting evidence.
- Confidence.
- Dependencies.
- Verification status.

## Module 3 - Evidence Mapping

Every planned sentence should trace back to evidence.

```text
Sentence
  -> Claim
  -> Evidence
  -> Source
  -> Verification
```

Nothing is written as fact without evidence.

Evidence categories:

| Category | Examples | Rule |
| --- | --- | --- |
| Primary | Government release, official statement, court filing, scientific paper, original interview. | Highest-weight factual support. |
| Secondary | Major news organization, industry publication, academic commentary. | Reliable support when attributed. |
| Tertiary | Analyst, expert opinion, historical comparison. | Context, not primary proof. |
| Speculative | Social media, rumors, anonymous claims. | Never presented as fact. |

## Module 4 - Confidence Scoring

Every claim receives confidence.

| Score | Meaning |
| ---: | --- |
| 100 | Verified by multiple primary sources. |
| 95 | Primary source. |
| 90 | Multiple major organizations. |
| 80 | Single reliable organization. |
| 70 | Reliable but incomplete. |
| 60 | Needs confirmation. |
| 40 | Weak. |
| 20 | Speculation. |
| 0 | Unsupported. |

The Writer should adjust language according to confidence. A 95-confidence claim can be stated plainly. A 60-confidence claim must be qualified. A speculative claim must be framed as unverified or excluded.

## Module 5 - Uncertainty Engine

Uncertainty is represented instead of hidden.

The reasoning model distinguishes:

- Known.
- Unknown.
- Unverified.
- Conflicting.
- Pending.
- Historical.

Example:

```json
{
  "known": ["The bill passed committee."],
  "unknown": ["The final Senate vote has not occurred."],
  "pending": ["The governor has not announced whether they will sign it."]
}
```

## Module 6 - Narrative Planning

Narrative Planning answers:

```text
How should readers learn this story?
```

Questions:

- What happened?
- Why now?
- Why is it important?
- Who is affected?
- What happens next?

Narrative blueprint:

```json
{
  "lead": "",
  "context": "",
  "evidence": "",
  "impact": "",
  "reaction": "",
  "futureOutlook": ""
}
```

## Module 7 - Paragraph Planner

Every paragraph receives a purpose. No filler paragraphs are allowed.

Example:

| Paragraph | Purpose |
| --- | --- |
| 1 | Breaking news / main event. |
| 2 | Background. |
| 3 | Evidence. |
| 4 | Context. |
| 5 | Analysis or impact. |
| 6 | Future outlook. |

Each paragraph stores:

- Goal.
- Evidence.
- Supporting sources.
- Facts.
- Transition.
- Confidence.

## Module 8 - Attribution Engine

Every important claim should answer:

```text
Who says this?
```

Avoid vague attribution when a specific source exists.

Instead of:

```text
Officials announced...
```

Prefer:

```text
According to the Department of Justice...
```

Attribution object:

```json
{
  "claim": "",
  "speaker": "",
  "organization": "",
  "source": "",
  "date": "",
  "confidence": 0
}
```

## Module 9 - Headline Reasoning

The headline is never guessed.

The engine evaluates:

- Main event.
- Importance.
- Novelty.
- Reader value.
- Search intent.
- Evidence strength.

Headline candidate object:

```json
{
  "headline": "",
  "whySelected": "",
  "weakness": "",
  "risk": "",
  "confidence": 0,
  "actor": "",
  "action": "",
  "consequence": ""
}
```

The required structure remains:

```text
Actor + Action + Consequence
```

## Module 10 - Context Engine

Context Engine asks:

```text
What must readers already know?
```

Missing context becomes a background or explanation paragraph. Context should be included only when it helps the reader understand the current event.

## Module 11 - Contradiction Detection

Before writing, the engine checks:

- Internal contradictions.
- Timeline conflicts.
- Number mismatches.
- Quote inconsistencies.
- Organization mismatch.
- Headline/body mismatch risk.

Contradictions are routed back to the Story Dossier Engine when they require evidence resolution.

## Module 12 - Transition Planner

Paragraphs should flow logically.

Transition types:

- Cause.
- Effect.
- Contrast.
- Continuation.
- Timeline.
- Expansion.
- Comparison.

Each transition receives a purpose and must be necessary, relevant, and supported.

## Module 13 - Reader Intent Modeling

The engine predicts reader questions.

Example:

```text
After paragraph 1, the reader may ask: Why?
After paragraph 3, the reader may ask: What happens next?
```

The plan should answer likely reader questions before the reader feels the article is incomplete.

## Module 14 - Source Balance Engine

The engine prevents over-reliance on one source type.

It tracks:

- Primary sources.
- Government sources.
- Academic sources.
- Major media.
- Local media.
- Experts.
- Corporate sources.

Source diversity informs claim confidence and paragraph placement.

## Module 15 - Quote Planning

The engine determines:

- Whether a quote should exist.
- Where it belongs.
- Which quote is most useful.
- How much quote material is necessary.

Avoid quote dumping. Every quote requires a purpose.

## Module 16 - Logical Flow Verification

The engine checks:

```text
Beginning
  -> Middle
  -> End
```

Every section must be necessary, relevant, supported, and coherent.

## Module 17 - Article Outline Generator

The final writing plan may include:

- Headline.
- Lead.
- Context.
- Evidence.
- Expert perspective.
- Implications.
- Future outlook.
- Closing.

The Writer receives this plan, not raw source fragments.

## Module 18 - Reasoning Verification

After planning, verify:

- Evidence coverage.
- Confidence consistency.
- Logical progression.
- Missing support.
- Uncertainty disclosure.
- Headline alignment.
- Attribution completeness.
- Paragraph purpose coverage.

## Module 19 - Reasoning Score

Overall reasoning score includes:

- Evidence quality.
- Logic.
- Completeness.
- Structure.
- Context.
- Transitions.
- Uncertainty.
- Attribution.
- Headline support.
- Reader clarity.

If the reasoning score is below threshold, the Writer does not draft. The issue returns to Dossier, Evidence, or Coordinator depending on the blocker.

## Reasoning Model Output

The Writer Reasoning Engine should output a structured model:

```json
{
  "storyId": "",
  "reasoningScore": 0,
  "storyModel": {},
  "reasoningGraph": [],
  "evidenceMap": [],
  "uncertaintyModel": {},
  "narrativeBlueprint": {},
  "paragraphPlan": [],
  "headlineCandidates": [],
  "attributionPlan": [],
  "sourceBalance": {},
  "readerQuestions": [],
  "verification": {},
  "readyForWriter": false
}
```

## Memory Integration

Successful reasoning paths become reusable assets.

The engine stores:

- Article planning patterns.
- Effective paragraph structures.
- Attribution strategies.
- Evidence weighting decisions.
- Uncertainty handling approaches.
- Verification outcomes.
- Reasoning templates by topic.
- Common failure patterns and corrections.

Future articles should begin with proven reasoning structures while adapting to the specific Story Dossier.

## Interfaces With Framework OS Projects

| Project | Interaction |
| --- | --- |
| Project 01 - Architecture | Provides execution boundaries and orchestration. |
| Project 02 - Production Pipeline | Supplies story dossiers and receives validated writing plans. |
| Project 03 - Story Dossier Engine | Provides entities, timelines, evidence, confidence, contradictions, and source metadata. |
| Project 05 - Editorial Intelligence | Reviews reasoning quality, identifies structural weaknesses, and returns repair recommendations. |
| Project 06 - Production Intelligence | Measures reasoning efficiency, bottlenecks, and optimization opportunities. |
| Project 07 - Learning Architecture | Stores successful reasoning patterns and promotes reusable strategies. |
| Project 08 - Governance | Enforces reasoning verification, auditability, approvals, and bounded execution. |
| Project 09 - Image Intelligence | Supplies image context that complements the narrative plan and verifies visual relevance. |
| Project 10 - Performance Engineering | Optimizes reasoning graph construction, memory usage, and execution speed. |
| Project 11 - Commercialization | Enables configurable reasoning profiles for different industries and customer requirements. |
| Project 12 - Patent Portfolio | Documents novel reasoning mechanisms, graph structures, verification methods, and adaptive planning. |
| Project 13 - Framework OS Integration | Integrates Writer Reasoning into the end-to-end Framework workflow. |

## Final Deliverable

The Writer Reasoning Engine is the Framework cognitive layer between information gathering and text generation.

Rather than treating writing as immediate prose generation, it transforms verified evidence into an explicit, auditable reasoning model. Every headline, paragraph, attribution, transition, and uncertainty disclosure is planned before drafting begins, creating a transparent chain from source evidence to public article.

Within Framework OS, the Writer Reasoning Engine enables consistent, explainable, and verifiable journalism while producing reusable reasoning patterns that improve with experience.
