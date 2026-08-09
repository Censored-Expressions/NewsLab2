const recoveryJobSchema = {
  required: ["eventId", "dossierRevisionId", "partialDossier", "recoveryRequirements", "nextAction"],
  partialDossierMustRetain: [
    "canonicalEventSignature",
    "factLedger",
    "timeline",
    "entities",
    "contradictions",
    "knownUnknowns",
    "sourceRegistry",
    "categoryClassification",
    "readiness",
    "imageInstructions",
    "writerContract"
  ],
  rule: "Recovery adds missing intelligence to the preserved dossier state instead of rebuilding from thin fragments."
};

module.exports = { recoveryJobSchema };
