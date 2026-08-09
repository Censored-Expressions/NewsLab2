function evaluateIntegrity(dossier = {}) {
  const signature = dossier.canonicalEventSignature || {};
  const factCount = Number(dossier.factLedger?.writingEligibleFactIds?.length || 0);
  const contaminationScore = Number(dossier.contaminationCheck?.contaminationScore || 0);
  const ready = Boolean(signature.primaryActor && signature.primaryAction && factCount >= 1 && contaminationScore <= 0.2);
  return {
    ready,
    blockers: [
      signature.primaryActor ? "" : "missing-primary-actor",
      signature.primaryAction ? "" : "missing-primary-action",
      factCount >= 1 ? "" : "missing-writing-eligible-fact",
      contaminationScore <= 0.2 ? "" : "event-contamination"
    ].filter(Boolean)
  };
}

module.exports = { evaluateIntegrity };
