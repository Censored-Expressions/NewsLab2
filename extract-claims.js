function extractClaims(text = "", eventId = "") {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(statement => statement.trim())
    .filter(statement => statement.length >= 40)
    .slice(0, 12)
    .map((statement, index) => ({
      factId: `${eventId || "event"}:claim_${index + 1}`,
      eventId,
      statement,
      sourceIds: [],
      verificationStatus: "unverified",
      writingEligible: false
    }));
}

module.exports = { extractClaims };
