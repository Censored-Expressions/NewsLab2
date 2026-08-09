const crypto = require("node:crypto");

function hashDossierRevision(dossier = {}, readiness = {}) {
  const payload = {
    eventId: dossier.eventId || dossier.storyId || "",
    revision: dossier.revision || dossier.dossierRevisionId || "",
    readinessTier: readiness.readinessTier || dossier.dossierBuilder?.readinessContract?.readinessTier || "",
    articleFormat: readiness.articleFormat || dossier.dossierBuilder?.readinessContract?.articleFormat || "",
    knownFacts: dossier.knownFacts || [],
    writingEligibleFactIds: dossier.factLedger?.writingEligibleFactIds || [],
    canonicalEventSignature: dossier.canonicalEventSignature || dossier.eventSignature?.canonical || null,
    timeline: dossier.timeline || [],
    sourceKeys: (dossier.sourcePool || []).map(source => source.url || source.source || source.title || "").filter(Boolean).slice(0, 40)
  };
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
}

module.exports = { hashDossierRevision };
