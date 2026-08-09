const dossierSchema = {
  required: [
    "dossierId",
    "eventId",
    "revision",
    "revisionHash",
    "canonicalEventSignature",
    "factLedger",
    "claimGraph",
    "storyUnderstanding",
    "timeline",
    "entities",
    "sourceRegistry",
    "readiness",
    "writerContract"
  ],
  layers: [
    "eventIdentity",
    "evidence",
    "timeline",
    "entities",
    "context",
    "understanding",
    "uncertainty",
    "productionContract",
    "imageInstructions"
  ],
  revisionRule: "Each completed dossier revision is immutable and hash-addressed. New evidence creates a new revision rather than mutating the active writing target.",
  understandingRule: "Story Understanding is the bridge between Knowledge and Reasoning. It answers what the evidence means before any writer, headline, image, editor, repair, newsletter, or Creator Desk output is produced.",
  rule: "The canonical dossier is the single intelligence object consumed by Writer, headline, image, editor, repair, newsletter, Creator Desk, and publisher."
};

module.exports = { dossierSchema };
