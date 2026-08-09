function classifyRecovery(dossier = {}) {
  const blockers = dossier.readiness?.blockingReasons || dossier.recoveryRequirements || [];
  const text = blockers.join(" ").toLowerCase();
  if (/segmentation|mixed|contamination|cluster/.test(text)) return "split-or-repair-cluster";
  if (/actor|action|identity/.test(text)) return "resolve-event-identity";
  if (/source|fact|evidence|attribution/.test(text)) return "enrich-evidence";
  return "rescore-dossier";
}

module.exports = { classifyRecovery };
