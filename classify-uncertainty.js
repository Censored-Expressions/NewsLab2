function classifyUncertainty(claims = []) {
  return claims.filter(claim => !claim.writingEligible).map(claim => claim.statement || String(claim || "")).slice(0, 12);
}

module.exports = { classifyUncertainty };
