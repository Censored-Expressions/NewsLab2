const { eventSignatureSchema } = require("./schemas/event-signature.schema");
const { claimSchema } = require("./schemas/claim.schema");
const { dossierSchema } = require("./schemas/dossier.schema");
const { readinessSchema } = require("./schemas/readiness.schema");
const { recoveryJobSchema } = require("./schemas/recovery-job.schema");
const { normalizeSource } = require("./intake/normalize-source");
const { extractClaims } = require("./intake/extract-claims");
const { resolveEntities } = require("./intake/resolve-entities");
const { buildEventSignature } = require("./clustering/build-event-signature");
const { scoreEventMatch } = require("./clustering/score-event-match");
const { detectContamination } = require("./clustering/detect-contamination");
const { splitMixedCluster } = require("./clustering/split-mixed-cluster");
const { segmentSourceEvents } = require("./clustering/segment-source-events");
const { buildFactLedger } = require("./intelligence/build-fact-ledger");
const { buildClaimGraph } = require("./intelligence/build-claim-graph");
const { buildStoryUnderstanding } = require("./intelligence/build-story-understanding");
const { buildTimeline } = require("./intelligence/build-timeline");
const { buildEntityGraph } = require("./intelligence/build-entity-graph");
const { detectContradictions } = require("./intelligence/detect-contradictions");
const { classifyUncertainty } = require("./intelligence/classify-uncertainty");
const { evaluateIntegrity } = require("./readiness/evaluate-integrity");
const { evaluateDepth } = require("./readiness/evaluate-depth");
const { selectOutputLane } = require("./readiness/select-output-lane");
const { classifyRecovery } = require("./recovery/classify-recovery");
const { prioritizeRecovery } = require("./recovery/prioritize-recovery");
const { executeRecovery } = require("./recovery/execute-recovery");
const { rescoreDossier } = require("./recovery/rescore-dossier");
const { versionDossier } = require("./persistence/version-dossier");
const { lockDossier } = require("./persistence/lock-dossier");
const { hashDossierRevision } = require("./persistence/hash-dossier-revision");
const { DossierRepository } = require("./persistence/dossier-repository");
const { dossierMetrics } = require("./observability/dossier-metrics");
const { dossierLifecycle } = require("./observability/dossier-lifecycle");

const dossierSubsystem = {
  version: "20260806-framework-dossier-subsystem-v2",
  mission: "Turn source material into one canonical, versioned intelligence object, then convert it into Story Understanding before downstream reasoning, writing, and publication work.",
  schemas: { eventSignatureSchema, claimSchema, dossierSchema, readinessSchema, recoveryJobSchema },
  intake: { normalizeSource, extractClaims, resolveEntities },
  clustering: { buildEventSignature, scoreEventMatch, detectContamination, splitMixedCluster, segmentSourceEvents },
  intelligence: { buildFactLedger, buildClaimGraph, buildStoryUnderstanding, buildTimeline, buildEntityGraph, detectContradictions, classifyUncertainty },
  readiness: { evaluateIntegrity, evaluateDepth, selectOutputLane },
  recovery: { classifyRecovery, prioritizeRecovery, executeRecovery, rescoreDossier },
  persistence: { versionDossier, lockDossier, hashDossierRevision, DossierRepository },
  observability: { dossierMetrics, dossierLifecycle }
};

module.exports = dossierSubsystem;
