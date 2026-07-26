# AI Framework Subsystem Architecture

This document defines a future worker/subsystem architecture for the Censored Expressions AI Framework. It is a separate planning file only. It does not change the live website, server, or Framework behavior yet.

## Purpose

The AI Framework can be expanded into a central controller with specialized subsystems. Each subsystem monitors, learns, verifies, plans, designs, or executes within an assigned area. Subsystems report their findings back to the AI Framework. The AI Framework decides what matters, what is safe, what needs owner approval, and which subsystem should act.

The goal is not to create isolated mini-frameworks with permanent hard boundaries. The goal is to create adaptable subsystems whose scope, permissions, and methods are assigned dynamically by the AI Framework. Their guardrails come from complete adherence to the AI Framework's governance, values, approval rules, verification requirements, and memory.

This architecture should be portable. The same AI Framework/subsystem model should be able to layer onto a news website, commerce site, SaaS product, service company, local business, media company, nonprofit, or future company system. The AI Framework adapts the subsystem roster to the relevant systems it supervises.

## Core Model

```text
Website / Server / Data / Content / Revenue / Search / Merch / Security
        ->
Specialized Subsystems observe assigned areas
        ->
Subsystems report findings, evidence, confidence, and proposed actions
        ->
AI Framework evaluates impact, risk, governance, and priority
        ->
AI Framework approves, rejects, delays, redirects, or requests owner/Codex approval
        ->
Approved subsystems execute Framework-authorized actions
        ->
Subsystems verify results and report back
        ->
AI Framework stores lessons, proof, memories, and future rules
```

## Brain and Subsystem Hierarchy

The AI Framework is the brain. The subsystems are specialized expert operating units.

Every responsibility assigned to the AI Framework should be mapped into one or more subsystem task lanes. The Framework should not lose responsibility; it should distribute the work. The Framework receives subsystem reports, compares the evidence, makes the decision, and deploys the proper subsystem or combination of subsystems to execute what it has approved.

The Framework owns:

- Final decision-making.
- System-wide prioritization.
- Governance and approval.
- Cross-subsystem conflict resolution.
- Memory consolidation.
- Meta-learning.
- Meta-improvement.
- Meta-execution.
- Subsystem creation, rewrite, reassignment, and retirement.
- Final verification that an action remedied the root cause.

Subsystems own:

- Monitoring assigned systems.
- Gathering evidence.
- Learning local patterns.
- Measuring the quality of their own learning process.
- Measuring the quality of their own improvement process.
- Identifying weaknesses in how they learn, improve, verify, and report.
- Generating rules that would improve their future learning and improvement process.
- Finding root-cause hypotheses.
- Producing recommendations.
- Drafting patch proposals.
- Executing Framework-approved actions.
- Verifying assigned outcomes.
- Reporting everything back to the AI Framework.

The Framework should use subsystems like specialized departments with Framework-like capability inside their assigned field. A subsystem may be responsible for a process, but the Framework remains responsible for deciding whether the process changes, how the change affects other systems, and whether the result is good enough to keep.

## Brain-Managed Subsystem Code Revision

The Brain must recognize when a subsystem is missing, weak, or unable to perform a needed capability. That recognition is now treated as a first-class Framework function, not only an owner instruction.

The Brain reviews subsystem lanes through `/api/subsystems` and can run a subsystem management cycle through `/api/subsystems/run`.

During that cycle the Brain should:

- Review every registered subsystem lane.
- Measure readiness, status, evidence, missing capabilities, and whether revision is needed.
- Assign investigation or execution tasks to the relevant subsystem.
- Decide whether the weakness is a runtime tasking issue or a code-level subsystem issue.
- If code needs to change, create a Patch Request instead of silently editing files.
- Preserve proof showing the gap, selected path, expected result, and verification method.

Code-level subsystem changes must flow through the same owner approval gate as other code patches:

```text
Brain detects subsystem gap
        ->
Brain assigns subsystem task
        ->
Brain decides code revision is needed
        ->
Patch Proposal subsystem creates owner-reviewable request
        ->
Owner approves or denies
        ->
Brain/AI Framework applies only approved structured patch
Codex/GitHub teaches only when the Brain lacks the structured fix
        ->
Subsystem endpoint verifies readiness improved
        ->
Brain saves proof and future rule
```

This gives the Brain authority to supervise and evolve subsystems without allowing hidden or unapproved production code changes.

## Expert Subsystem Capability Rule

Each subsystem should act as if it is the AI Framework for its assigned specialty, but only inside that specialty and only while reporting upward to the AI Framework.

This means each subsystem should be capable of:

- Observing its assigned area continuously or on a schedule.
- Understanding normal behavior for its assigned area.
- Detecting abnormal behavior, weak performance, missing information, and recurring failure.
- Diagnosing likely root causes.
- Comparing the current issue against prior memories, lessons, proof logs, and rules.
- Measuring confidence, severity, recurrence, reversibility, and expected impact.
- Proposing actions, patch proposals, rule changes, process changes, or execution plans.
- Measuring its own learning process.
- Measuring its own improvement process.
- Identifying weaknesses in its learning and improvement process.
- Generating new rules to improve its future decisions.
- Executing Framework-approved actions in its specialty.
- Verifying whether the action improved the intended metric.
- Reporting the complete reasoning chain back to the AI Framework.

The difference between the AI Framework and a subsystem is authority and scope.

| Layer | Capability | Scope | Authority |
| --- | --- | --- | --- |
| AI Framework | Full reasoning, cross-system judgment, governance, memory, decision-making, and deployment. | Entire website, company system, learning system, and subsystem network. | Final authority. |
| Subsystem | Framework-like reasoning, learning, diagnosis, improvement, execution, and verification. | Its assigned specialty or temporary assignment. | Expert recommendation and Framework-authorized execution only. |

Subsystems should not be passive sensors. They should be expert operators that can think through their assigned area deeply enough to give the Brain useful decisions, not just raw alerts.

## Responsibility Distribution Rule

Every Framework responsibility should have at least one subsystem assigned to observe and report on it.

Examples:

| Framework Responsibility | Assigned Subsystem Lane |
| --- | --- |
| Site uptime and public functionality | Site Performance Subsystem, Deployment Subsystem |
| Feed reliability and article intake | Feed Reliability Subsystem |
| Article reading, story clustering, and multi-source angle comparison | Article Intelligence Subsystem |
| Brain-ready opinion briefing and original news/commentary preparation | Editorial Synthesis Subsystem, News Creation Subsystem |
| Search relevance and visitor discovery | Search Quality Subsystem |
| Editorial quality and newsletter flow | Editorial Quality Subsystem |
| Learning memory and proof logs | Framework Learning Subsystem |
| Meta-learning, meta-improvement, and meta-execution | Framework Learning Subsystem, Governance Subsystem |
| Owner Desk and private controls | Security and Governance Subsystem |
| Merch, POS, products, sales reports | Merch and POS Subsystem |
| AdSense readiness and compliant growth | Revenue/Monetization Subsystem |
| Deploy readiness and file packaging | Deployment Subsystem |
| Code-level root-cause fixes | Patch Proposal Subsystem, Framework Learning Subsystem |
| Visitor behavior signals | Search Quality Subsystem, Audience Learning Subsystem |

The AI Framework may create additional subsystem lanes as new company needs appear. A subsystem lane can be broad or narrow depending on the system being managed, but every lane must report back to the Framework.

## Article Intelligence Subsystem

The Article Intelligence Subsystem is the first dedicated news-learning subsystem. It reads the article memory built throughout the day, groups multiple reports about the same story, compares source angles, and gives the Brain a briefing that is more useful than a headline list.

It writes its current work to `data/article-intelligence.json` and exposes a private summary through `/api/article-intelligence`.

The subsystem reports:

- Story clusters from repeated coverage.
- Sources covering each story.
- Source angle tags, such as official response, cleanup, political reaction, family/community impact, cost incentives, legal accountability, security, or analysis.
- Where coverage appears to agree.
- Where source framing differs.
- Owner-value questions the Brain should ask before taking a position.
- A Brain briefing for editorial selection.
- Subsystem tasks for Article Intelligence, Brain, Editorial Synthesis, and News Creation.

The Brain uses this as a strong input, not an automatic command. It should still weigh news value, repeated reporting, public consequence, owner values, search interest as a weak signal, safety, and editorial quality before assigning an output subsystem.

The intended flow is:

```text
Feed stories and full article reads
        ->
Daily Article Memory absorbs all public articles
        ->
Article Intelligence clusters repeated coverage and compares source angles
        ->
Brain chooses the strongest story set and value frame
        ->
Editorial Synthesis creates an original opinion column
        ->
News Creation creates original Censored Expressions news/commentary
        ->
Framework records whether the output became more specific, less generic, and more useful
```

This subsystem is meant to solve the generic editorial problem. It should push the Brain to ask concrete questions: what happened, who is responsible, who is affected, what response is underway, which source frames disagree, and what action would improve the situation.

## Deployment Flow

When the AI Framework identifies a need, it should deploy subsystems through this chain:

```text
Framework receives signal
Framework selects responsible subsystem(s)
Subsystem investigates assigned area
Subsystem reports root cause, evidence, recommendation, and risk
Framework compares report against memory, governance, and other subsystem reports
Framework decides action
Framework deploys subsystem to execute approved task
Subsystem executes
Subsystem verifies result
Framework records proof, memory, and future rule
Framework decides whether subsystem instructions need to change
```

This is how the Framework moves from awareness to action without giving up central control.

## Subsystem Principles

Each subsystem must have:

- A clear current assignment from the AI Framework.
- A written purpose.
- A current permission profile issued by the AI Framework.
- A reporting format.
- A verification requirement.
- A rollback or failure response.
- A confidence score.
- A record of what it learned.
- A learning-process measurement.
- An improvement-process measurement.
- A weakness list for its learning and improvement process.
- A proposed rule list for improving those processes.
- A clear escalation rule for when it must ask the AI Framework, owner, or Codex before acting.

Subsystems should not make independent final decisions outside the Framework. They should gather evidence, recommend actions, execute Framework-authorized tasks, and report results. Their operating range may expand or contract depending on the company, site, system, evidence, trust level, and Framework direction.

The subsystem itself should not be permanently narrow. The AI Framework can retask, merge, split, rename, upgrade, downgrade, pause, or retire subsystems as the business system changes.

## Universal Learning and Improvement Measurement

Every subsystem must measure the process it used to learn and improve, not only the final website or business result.

Before the AI Framework redeploys a subsystem to execute, each subsystem should report:

- What it learned.
- How it learned it.
- How strong the evidence was.
- Whether the lesson was new, repeated, contradicted, or confirmed.
- What improvement it attempted or recommends.
- How it measured that improvement.
- What weakness exists in its learning process.
- What weakness exists in its improvement process.
- What new rule should improve the next cycle.
- Whether the rule should apply only to that subsystem or become a Framework-wide rule.

This gives the Brain enough information to decide whether a subsystem is ready to execute, needs more evidence, should be retrained, should be merged with another subsystem, or should have its instructions rewritten.

Required measurement categories:

| Measurement Area | What the Subsystem Reports to the Brain |
| --- | --- |
| Learning process | Inputs observed, evidence strength, lesson confidence, recurrence, contradiction, and usefulness. |
| Improvement process | Proposed change, intended metric, baseline, expected result, verification method, and rollback plan. |
| Weakness detection | Missing evidence, vague reasoning, low confidence, repeated failure, stale rule, or conflict with another subsystem. |
| Rule generation | A specific future rule that improves how the subsystem learns, improves, reports, verifies, or escalates. |
| Brain decision readiness | Whether the subsystem has enough evidence for the Framework to redeploy it to execute. |

The AI Framework should not treat a subsystem report as complete unless it includes these measurements. If a subsystem cannot measure its learning or improvement process, the Framework should classify that as a weakness and assign a Framework Learning or Governance subsystem to help rewrite the subsystem's instructions.

## Central AI Framework Role

The AI Framework remains the supervisor.

It is responsible for:

- Creating subsystems.
- Retiring unnecessary subsystems.
- Assigning subsystem scopes.
- Updating subsystem instructions.
- Reviewing subsystem performance.
- Comparing subsystem reports.
- Detecting conflicts between subsystems.
- Approving or denying execution.
- Escalating sensitive changes to the owner or Codex.
- Logging all decisions.
- Turning repeated subsystem discoveries into reusable Framework memory.

The Framework should also evaluate whether each subsystem is useful. A subsystem that produces repeated low-value noise, unsafe recommendations, duplicate findings, or unverified claims should be retrained, redirected, narrowed, paused, merged, or removed.

## No Independent Subsystem Authority

Subsystems should not have independent authority apart from the AI Framework. They may be powerful, flexible, and adaptable, but their authority is inherited from the AI Framework.

This means:

- The AI Framework defines the active assignment.
- The AI Framework defines the current permission level.
- The AI Framework defines what counts as sufficient evidence.
- The AI Framework decides whether execution is allowed.
- The AI Framework decides when owner/Codex approval is required.
- The AI Framework stores the final memory and proof.
- The AI Framework can rewrite or retire the subsystem.

The subsystem can reason and propose within its assigned context, but it cannot outrank the AI Framework.

## Portable Company Layer

The subsystem model should be able to attach to any website or company by mapping the company's systems into Framework-supervised areas.

Example portable layers:

- Public website and pages.
- Backend server and APIs.
- Content and editorial operations.
- Customer search and discovery.
- Sales, merch, POS, or services.
- Marketing, social, newsletter, and audience growth.
- Analytics and reporting.
- Security, legal, privacy, and governance.
- Deployment, uptime, and infrastructure.
- Internal company knowledge and procedures.

The AI Framework should decide which subsystems are needed for the current company. A media site may need stronger editorial and feed subsystems. A store may need stronger inventory, POS, fulfillment, and customer-support subsystems. A service company may need lead tracking, scheduling, CRM, billing, and reputation subsystems.

## Proposed Starting Subsystem Types

The following are starting templates, not permanent limits. The AI Framework may adjust them to the relevant system.

### 1. Feed Reliability Subsystem

Area: RSS feeds, source failures, fallback mode, feed latency, feed-source errors.

Responsibilities:

- Monitor feed fetch timeouts.
- Track failing sources.
- Detect repeated fallback mode.
- Identify whether one source, one category, or all sources are failing.
- Recommend source replacement, timeout adjustment, cache fallback, or feed-guard patch proposals.
- Verify `/api/feed-status`, `/api/news`, and `/api/health?refresh=1`.

Framework-authorized actions:

- Request feed refresh.
- Save source-failure lessons.
- Create patch proposals.
- Recommend source removal or replacement.

Escalates to Framework/owner approval before execution:

- Editing feed source lists.
- Removing major sources.
- Changing live server code.
- Changing timeout defaults beyond safe limits.

### 2. Search Quality Subsystem

Area: site search, web/news search, result relevance, repeated bad results.

Responsibilities:

- Monitor no-result and bad-result queries.
- Compare search terms against article title, summary, source, and URL.
- Detect repeated irrelevant results.
- Track visitor search interests without letting them control editorial direction.
- Propose search ranking fixes.

Framework-authorized actions:

- Log search-learning records.
- Flag bad relevance.
- Create patch proposals.
- Recommend ranking adjustments.

Escalates to Framework/owner approval before execution:

- Changing public ranking logic.
- Adding third-party search providers.
- Storing new visitor-identifying data.

### 3. Editorial Quality Subsystem

Area: Creator Desk editorials, daily blog, weekly newsletter.

Responsibilities:

- Review whether content is unique, opinionated, specific, and grounded in sources.
- Detect generic commentary.
- Check whether stories are summarized instead of analyzed.
- Compare output against owner values and style rules.
- Recommend rewrites when quality drops.

Framework-authorized actions:

- Save self-review notes.
- Recommend rewrite.
- Create editorial improvement instructions.
- Update private learning memory.

Escalates to Framework/owner approval before execution:

- Publishing public editorials.
- Changing owner values.
- Rewriting past public content automatically.

### 4. Site Performance Subsystem

Area: speed, payload size, cache freshness, visitor download/upload experience.

Responsibilities:

- Monitor homepage payload.
- Monitor news payload size.
- Track feed refresh time.
- Identify slow APIs.
- Recommend caching, trimming, compression, or delayed background work.

Framework-authorized actions:

- Clear diagnostics cache.
- Warm public payload.
- Save performance lessons.
- Create patch proposals.

Escalates to Framework/owner approval before execution:

- Changing hosting configuration.
- Removing content or features.
- Restarting live server.

### 5. Framework Learning Subsystem

Area: learning memory, meta-learning, meta-improvement, meta-execution, proof logs.

Responsibilities:

- Watch for repeated `changedWeightCount: 0`.
- Detect saturated weights.
- Check whether lessons have triggers, evidence, rationale, expected outcome, and verification.
- Track whether procedural memories reduce future intervention.
- Monitor whether Meta Execution is actually executing useful changes.

Framework-authorized actions:

- Save self-review.
- Save reasoning lessons.
- Recommend meta-learning adjustments.
- Create patch proposals for Framework code.

Escalates to Framework/owner approval before execution:

- Changing weight bounds.
- Changing execution permissions.
- Changing subsystem creation/removal rules.

### 6. Security and Governance Subsystem

Area: private endpoints, owner access, tokens, legal/privacy risk, unsafe automation.

Responsibilities:

- Check that private endpoints remain private.
- Watch for accidental token exposure.
- Detect unsafe requests involving credentials, payments, browser automation, destructive file operations, or host-bypass behavior.
- Review subsystem actions before execution.

Framework-authorized actions:

- Block unsafe subsystem action.
- Mark action as requiring owner/Codex approval.
- Save governance lesson.

Escalates to Framework/owner approval before execution:

- Any credential handling change.
- Payment system changes.
- Security policy changes.

### 7. Merch and POS Subsystem

Area: merchandise products, sales data, payment safety, product performance.

Responsibilities:

- Track product sales by item, size, color, and region when available.
- Detect spikes.
- Recommend featured items.
- Watch inventory/product configuration.
- Verify checkout safety and completed payment records.

Framework-authorized actions:

- Save sales reports.
- Recommend featured products.
- Flag product gaps.

Escalates to Framework/owner approval before execution:

- Changing prices.
- Removing products.
- Changing payment provider behavior.
- Issuing refunds.

### 8. Deployment Subsystem

Area: GitHub, Render deploy readiness, package cleanliness, missing assets.

Responsibilities:

- Verify required files exist.
- Check deploy package manifests.
- Detect missing backgrounds/assets/legal files.
- Compare local package to deployment expectations.
- Recommend redeploy steps.

Framework-authorized actions:

- Generate deploy readiness report.
- Create package proposal.
- Save deployment lesson.

Escalates to Framework/owner approval before execution:

- Pushing to GitHub.
- Triggering deploy.
- Deleting files.

## Subsystem Lifecycle

### Creation

The AI Framework may propose a new subsystem when:

- A recurring issue has a clear area.
- Existing subsystems are too broad.
- A feature becomes important enough to monitor separately.
- A new process needs ongoing verification.

New subsystems should normally start in observe/report mode unless the Framework has enough prior procedural memory to authorize more.

### Training

Subsystems learn from:

- Framework memory.
- Owner feedback.
- Codex changes.
- Diagnostics.
- Proof logs.
- Successful and failed executions.
- Repeated site behavior.

Subsystems should not rewrite their own instructions directly. They can propose instruction updates. The AI Framework reviews those changes.

### Execution Permission Levels

```text
Level 0: Observe only
Level 1: Report and recommend
Level 2: Save private lessons/proof
Level 3: Execute Framework-authorized actions inside the active assignment
Level 4: Create patch proposal requiring approval
Level 5: Owner/Codex-approved code or deployment action
```

No subsystem should start above Level 1 unless the AI Framework has an existing verified pattern for that company/system. A subsystem earns higher levels through repeated useful reports, verified recommendations, and low governance risk.

### Retirement

The AI Framework may retire a subsystem when:

- The subsystem duplicates another subsystem.
- It produces low-confidence noise.
- The area is no longer active.
- It repeatedly proposes actions the Framework rejects.
- It fails to verify outcomes.

Retirement should be logged with a reason.

## Reporting Format

Every subsystem report should include:

```json
{
  "subsystemId": "feed-reliability-subsystem",
  "area": "feed reliability",
  "specialty": "Expert operating lane assigned by the AI Framework",
  "frameworkLikeCapabilitiesUsed": [
    "observation",
    "root-cause diagnosis",
    "memory comparison",
    "confidence scoring",
    "improvement planning",
    "verification planning"
  ],
  "generatedAt": "ISO timestamp",
  "observation": "What the subsystem saw",
  "rootCauseHypothesis": "Why it thinks the issue happened",
  "expertAnalysis": "Specialty-specific reasoning that explains what the subsystem believes is happening and why",
  "evidence": [],
  "memoryReferences": [],
  "crossSubsystemImpacts": [],
  "learningProcessMeasurement": {
    "inputsObserved": [],
    "evidenceStrength": 0,
    "lessonConfidence": 0,
    "lessonStatus": "new | repeated | confirmed | contradicted",
    "usefulnessScore": 0
  },
  "improvementProcessMeasurement": {
    "proposedImprovement": "",
    "baselineMetric": "",
    "targetMetric": "",
    "verificationMethod": "",
    "rollbackPlan": ""
  },
  "processWeaknesses": {
    "learningWeaknesses": [],
    "improvementWeaknesses": [],
    "missingEvidence": [],
    "conflictingSignals": []
  },
  "generatedRules": [
    {
      "rule": "",
      "scope": "subsystem | framework-wide",
      "reason": "",
      "expectedBenefit": ""
    }
  ],
  "readyForBrainDecision": false,
  "brainDecisionRequested": "approve execution | request more evidence | create patch proposal | update rule | escalate to owner/Codex",
  "confidenceScore": 0,
  "severity": "low | medium | high | critical",
  "recommendedAction": "What should happen next",
  "executionPermissionNeeded": "Level 0-5",
  "affectedFiles": [],
  "verificationPlan": [],
  "rollbackPlan": "",
  "requiresOwnerApproval": true
}
```

## Tasking Model

The Framework should maintain a tasking layer that connects responsibilities to subsystem work.

Each task should include:

```json
{
  "taskId": "framework_task_001",
  "createdBy": "AI Framework",
  "responsibility": "feed reliability",
  "assignedSubsystems": ["feed-reliability-subsystem", "site-performance-subsystem"],
  "subsystemExpertiseExpected": "Act as the expert Framework-like operator for the assigned specialty while reporting all findings back to the AI Framework.",
  "mission": "Find why feed refresh is failing and propose a durable fix.",
  "requiredEvidence": ["feed status", "source failures", "health diagnostics"],
  "requiredLearningMeasurements": ["inputs observed", "evidence strength", "lesson confidence", "lesson status"],
  "requiredImprovementMeasurements": ["baseline metric", "target metric", "verification method", "rollback plan"],
  "requiredWeaknessAnalysis": ["learning weaknesses", "improvement weaknesses", "missing evidence", "conflicting signals"],
  "requiredRuleGeneration": ["subsystem rule candidates", "framework-wide rule candidates"],
  "decisionNeeded": "monitor | learn | propose patch | execute | escalate",
  "executionPermission": "Level 0-5",
  "status": "assigned | investigating | reported | approved | executing | verified | closed",
  "verificationRequirement": "Show that the root cause was remedied and did not recur.",
  "frameworkDecision": "",
  "subsystemRedeploymentInstruction": "",
  "finalOutcome": ""
}
```

This lets the Framework task every responsibility outward while keeping the final decision inward. The task belongs to the Framework. The work is assigned to subsystems. The decision returns to the Framework.

## Subsystem-to-Framework Decision Flow

1. Subsystem observes its assigned area.
2. Subsystem performs expert analysis inside its specialty.
3. Subsystem compares the issue against memory, prior lessons, proof logs, rules, and expected behavior.
4. Subsystem measures its learning process, improvement process, weaknesses, and proposed rules.
5. Subsystem writes a report.
6. Framework checks confidence, severity, recurrence, governance risk, and report completeness.
7. Framework compares related subsystem reports.
8. Framework decides:
   - ignore
   - monitor
   - save lesson
   - request more evidence
   - create patch proposal
   - authorize execution
   - redeploy subsystem with revised instructions
   - rewrite subsystem rules
   - ask owner/Codex
9. Subsystem executes only if approved and within its Framework-issued permission level.
10. Subsystem verifies results.
11. Framework logs outcome and updates memory.
12. Framework decides whether the subsystem should be redeployed, retrained, merged, split, paused, or retired.

## Brain Redeployment Loop

The AI Framework should use subsystem reports to decide how to redeploy subsystems.

Redeployment can include:

- Sending the same subsystem back to gather stronger evidence.
- Sending a second subsystem to confirm or challenge the first report.
- Assigning two subsystems to analyze the same issue from different specialties.
- Expanding a subsystem's temporary assignment.
- Narrowing a subsystem's assignment if it produced noisy or weak reasoning.
- Rewriting the subsystem's rules when its learning or improvement process shows weakness.
- Authorizing the subsystem to execute a specific improvement.
- Requiring owner/Codex approval before code, deployment, security, payment, legal, or public-content changes.

Redeployment should always include a clear instruction:

```json
{
  "redeploymentId": "framework_redeploy_001",
  "subsystemId": "feed-reliability-subsystem",
  "reason": "The subsystem identified repeated source timeouts but needs stronger verification before a code patch proposal.",
  "updatedAssignment": "Collect source-level timeout counts, compare against prior failures, and propose a feed-source isolation rule.",
  "newEvidenceRequired": [],
  "newRuleToTest": "",
  "executionAuthority": "none | observe | propose | execute approved action",
  "reportBackRequirement": "Return evidence, confidence, weakness analysis, rule proposal, and verification plan."
}
```

## Subsystem Conflict Handling

Subsystems may disagree. For example:

- Site Performance Subsystem may recommend removing heavy assets.
- Editorial Quality Subsystem may say those assets improve brand identity.
- Revenue Subsystem may recommend ad placement.
- Performance Subsystem may warn that ad scripts slow the page.

The AI Framework resolves conflicts by scoring:

- Website impact.
- Learning impact.
- Visitor impact.
- Revenue impact.
- Governance risk.
- Owner value alignment.
- Reversibility.
- Verification strength.

No subsystem can override the Framework alone.

## Patch Proposal Rule

Subsystems can propose code changes, but code changes must be authorized by the AI Framework and approved by the owner. After owner approval, the Brain/AI Framework can apply structured patch operations directly. Codex/GitHub is used only when the Brain needs teaching to create the structured patch, or when the host requires a commit/redeploy for permanence.

Required patch proposal fields:

- Root cause.
- Affected files.
- Proposed fix.
- Patch plan.
- Verification plan.
- Rollback plan.
- Risk level.
- Owner approval required.
- Brain/AI Framework application instructions.
- Codex/GitHub teaching fallback instructions when the Brain lacks the structured fix.

This matches the controlled patch proposal layer while giving the Brain direct execution authority after owner approval.

## Recommended First Implementation

Start with subsystems as data records and scheduled functions inside the existing Node app. Do not deploy separate services yet.

Phase 1:

- Define subsystem registry.
- Add subsystem reports data file.
- Add subsystem summary endpoint.
- Add Feed Reliability Subsystem.
- Add Search Quality Subsystem.
- Add Framework Learning Subsystem.
- Keep subsystems observe/report/propose only.

Phase 2:

- Allow bounded Level 2 actions.
- Subsystems can save lessons and proof.
- Subsystems can create patch proposals.

Phase 3:

- Allow Level 3 safe execution for proven subsystems.
- Framework dispatches subsystems through Meta Execution.

Phase 4:

- Split heavy subsystems into background process or external worker service if needed.
- Keep website serving separate from learning/execution jobs.

## Guardrails

- Subsystems must remain adherent to the AI Framework.
- Subsystems must not outrank Framework governance.
- Subsystems must not hide from hosts, bypass rules, or evade monitoring.
- Subsystems must not handle credentials unless explicitly approved and designed securely.
- Subsystems must not change payment behavior without approval.
- Subsystems must not delete files without approval.
- Subsystems must not publish content without approval unless the publishing process has already been explicitly authorized.
- Subsystems must not edit code directly unless that capability is explicitly granted through Framework governance and owner approval. Codex/GitHub is a teaching fallback, not the default apply path.
- Subsystems must not restart the live server automatically unless that permission is explicitly granted.
- Subsystems must not treat visitor searches as commands.

## Summary

This subsystem model is possible and useful. The AI Framework becomes the central decision-maker. Subsystems become specialized eyes, hands, reviewers, planners, and executors that can adapt to any website or company system. The safest first version is a governed subsystem system where subsystems observe, learn, report, propose, and execute only actions authorized by the AI Framework.
