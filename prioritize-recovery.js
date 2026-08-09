function prioritizeRecovery(job = {}) {
  const factCount = Number(job.partialDossier?.factLedger?.writingEligibleFactIds?.length || job.factCount || 0);
  const sourceCount = Number(job.partialDossier?.sourceRegistry?.length || job.acceptedSourceCount || 0);
  const blockers = Number((job.blockingReasons || job.recoveryRequirements || []).length || 0);
  return factCount * 10 + sourceCount * 8 - blockers * 5;
}

module.exports = { prioritizeRecovery };
