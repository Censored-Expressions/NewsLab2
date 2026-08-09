const { buildClaimGraph } = require("./build-claim-graph");

function buildFactLedger(claims = [], eventId = "") {
  const facts = claims.map((claim, index) => ({
    factId: claim.factId || `${eventId || "event"}:fact_${index + 1}`,
    eventId: claim.eventId || eventId,
    statement: claim.statement || String(claim || ""),
    actor: claim.actor || "",
    action: claim.action || "",
    object: claim.object || "",
    time: claim.time || "",
    location: claim.location || "",
    sourceIds: claim.sourceIds || [],
    independentSourceCount: Number(claim.independentSourceCount || (claim.sourceIds || []).length || 0),
    verificationStatus: claim.verificationStatus || "unverified",
    writingEligible: Boolean(claim.writingEligible),
    confidence: Number(claim.confidence || 0),
    articleRole: claim.articleRole || (claim.writingEligible ? "evidence" : "review")
  }));
  return {
    facts,
    writingEligibleFactIds: facts.filter(fact => fact.writingEligible).map(fact => fact.factId),
    claimGraph: buildClaimGraph(facts, claims)
  };
}

module.exports = { buildFactLedger };
