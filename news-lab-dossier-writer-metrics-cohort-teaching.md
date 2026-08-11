# News Lab Teaching: Dossier Gate and Cohort Metrics

Date: 2026-08-10

## Owner Direction
The Owner Desk export showed that collection is no longer the main blocker. The concentrated failure chain is now:

Story Dossier -> Writer Reasoning -> Headline Generator -> Targeted Repair.

The export also showed impossible dashboard rates such as first-pass values above 100%, which means current-cycle counts were being mixed with carried-forward public inventory.

## Framework Lesson
Dossier existence is not dossier readiness. A story may only reach Writer Reasoning when the dossier is locked, semantically separated, and appropriate for its article format.

## Executable Rules Added

1. Binary Dossier Writer Gate
   - A brief may proceed with a coherent minimal dossier.
   - A standard or deep article must prove:
     - canonical actor
     - canonical action
     - event object or consequence
     - verified facts
     - attribution
     - timeline
     - necessary context
     - semantic category
     - known unknowns
     - no event contamination

2. Dossier Readiness Contract
   - The existing readiness contract now consumes the binary writer gate.
   - Missing binary fields are added to `missing`, `blockingReasons`, and the decision path.
   - Writer Reasoning must hold as `needs-dossier-evidence` when the gate fails.

3. Cohort-Safe Production Metrics
   - Stage rows now include:
     - `cycleId`
     - `workflowVersion`
     - `inputCount`
     - `outputCount`
     - `newlyCreatedCount`
     - `carriedForwardCount`
     - `failedCount`
     - `timestamp`
   - Current-cycle efficiency uses new output only.
   - Existing public shelf inventory is carried-forward inventory and cannot inflate first-pass or final approval rates.

## Verification

- `node --check server.js`

## Reusable Pattern
When a metric reports impossible conversion, the Brain should separate new-cycle work from existing inventory before making optimization decisions. When an article fails after a dossier exists, the Brain should inspect binary dossier readiness before blaming the Writer or Editor.
