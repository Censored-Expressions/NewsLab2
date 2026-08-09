function buildClaimGraph(records = [], rawClaims = []) {
  const facts = Array.isArray(records) ? records : [];
  const claims = Array.isArray(rawClaims) ? rawClaims : [];
  return {
    version: "20260806-claim-graph-v1",
    rawClaims: claims.map((claim, index) => ({
      rawClaimId: claim.rawClaimId || `raw_claim_${index + 1}`,
      statement: claim.statement || String(claim || ""),
      sourceIds: claim.sourceIds || []
    })).filter(claim => claim.statement).slice(0, 60),
    normalizedClaims: facts.map(fact => ({
      factId: fact.factId,
      statement: fact.statement,
      actor: fact.actor || "",
      action: fact.action || "",
      object: fact.object || "",
      time: fact.time || "",
      sourceIds: fact.sourceIds || [],
      confidence: Number(fact.confidence || 0),
      writingEligible: Boolean(fact.writingEligible),
      articleRole: fact.articleRole || ""
    })),
    corroboratedFacts: facts.filter(fact => fact.verificationStatus === "corroborated"),
    disputedFacts: facts.filter(fact => fact.verificationStatus === "disputed" || fact.lane === "disputed"),
    contextualFacts: facts.filter(fact => fact.lane === "contextual" || fact.articleRole === "context"),
    inferredRelationships: [],
    prohibitedInferences: facts
      .filter(fact => !fact.writingEligible || fact.verificationStatus === "disputed")
      .map(fact => ({
        claimId: fact.factId,
        statement: fact.statement,
        reason: fact.verificationStatus || "not-writing-eligible"
      }))
      .slice(0, 24),
    rule: "The Writer may use only writing-eligible normalized claims. Disputed and prohibited claims can guide caution but cannot become unqualified article text."
  };
}

module.exports = { buildClaimGraph };
