function evaluateDepth(dossier = {}) {
  const factCount = Number(dossier.factLedger?.writingEligibleFactIds?.length || 0);
  const sourceCount = Number(dossier.sourceRegistry?.length || 0);
  if (factCount >= 8 && sourceCount >= 4) return { articleFormat: "deep-article", depth: "high" };
  if (factCount >= 4 && sourceCount >= 2) return { articleFormat: "standard-article", depth: "moderate" };
  return { articleFormat: "developing-brief", depth: "low" };
}

module.exports = { evaluateDepth };
