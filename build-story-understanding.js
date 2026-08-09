function text(value = "", max = 320) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function buildStoryUnderstanding({ dossier = {}, canonicalIntelligence = {}, readiness = {} } = {}) {
  const revision = canonicalIntelligence.revision || {};
  const eventIdentity = canonicalIntelligence.eventIdentity || {};
  const evidence = canonicalIntelligence.evidence || {};
  const intelligence = canonicalIntelligence.intelligence || {};
  const claimGraph = dossier.factLedger?.claimGraph || {};
  const normalizedClaims = asArray(claimGraph.normalizedClaims || dossier.factLedger?.facts);
  const writingFacts = normalizedClaims
    .filter(claim => claim && claim.writingEligible !== false && (claim.statement || claim.fact))
    .map((claim, index) => ({
      factId: claim.factId || `understanding_fact_${index + 1}`,
      statement: text(claim.statement || claim.fact),
      sourceIds: claim.sourceIds || [],
      confidence: Number(claim.confidence || evidence.evidenceStrength || 0),
      articleRole: claim.articleRole || (index === 0 ? "lead" : "evidence")
    }))
    .filter(claim => claim.statement)
    .slice(0, 14);
  const fallbackFacts = asArray(evidence.verifiedFacts)
    .map((statement, index) => ({
      factId: `understanding_verified_${index + 1}`,
      statement: text(statement),
      sourceIds: [],
      confidence: Number(evidence.evidenceStrength || 60),
      articleRole: index === 0 ? "lead" : "evidence"
    }))
    .filter(claim => claim.statement);
  const facts = writingFacts.length ? writingFacts : fallbackFacts;
  const whatHappened = text(eventIdentity.topic || dossier.whatHappened || facts[0]?.statement);
  const whoDidIt = text(eventIdentity.primaryActor || dossier.canonicalEventSignature?.primaryActor, 140);
  const whatChanged = text(eventIdentity.consequence || eventIdentity.primaryConsequence || facts[1]?.statement || whatHappened);
  const stillUnknown = asArray(intelligence.stillUnknown || dossier.knownUnknowns || dossier.unknownFacts).map(item => text(item, 220)).filter(Boolean).slice(0, 10);
  const disputed = [
    ...asArray(claimGraph.disputedFacts).map(item => item.statement || item.fact || item),
    ...asArray(evidence.disputedFacts),
    ...asArray(dossier.contradictions)
  ].map(item => text(typeof item === "string" ? item : item.claim || item.summary, 240)).filter(Boolean).slice(0, 10);
  const prohibited = [
    ...asArray(intelligence.neverInfer),
    ...asArray(claimGraph.prohibitedInferences).map(item => item.statement || item.claim || item),
    ...disputed.map(item => `Do not state disputed claim as settled: ${item}`)
  ].map(item => text(item, 260)).filter(Boolean).slice(0, 14);
  const sourceCount = Number(evidence.sourceCount || dossier.evidence?.sourceCount || dossier.sourcePool?.length || 0);
  const minimumFacts = readiness.articleFormat === "breaking-brief" ? 2 : readiness.articleFormat === "deep-article" ? 5 : 3;
  const blockers = [
    whatHappened ? "" : "understanding-missing-what-happened",
    whoDidIt ? "" : "understanding-missing-specific-actor",
    facts.length >= minimumFacts ? "" : "understanding-needs-more-writing-eligible-evidence",
    sourceCount >= 1 ? "" : "understanding-needs-attributable-source",
    whatChanged ? "" : "understanding-missing-what-changed"
  ].filter(Boolean);
  const evidenceMap = facts.map((fact, index) => ({
    ...fact,
    supports: [index === 0 ? "what-happened" : "evidence", fact.articleRole === "context" ? "background-or-context" : ""].filter(Boolean)
  }));
  return {
    active: true,
    id: `story_understanding_${String(revision.id || eventIdentity.canonicalEventId || "story").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 96)}`,
    version: "20260806-story-understanding-v1",
    dossierRevisionId: revision.id || "",
    dossierRevisionHash: revision.hash || "",
    canonicalEventId: eventIdentity.canonicalEventId || "",
    answers: {
      whatHappened,
      whoDidIt,
      whoWasAffected: asArray(intelligence.whoIsAffected || dossier.people || dossier.organizations).slice(0, 12),
      whatChanged,
      whyThisIsNews: text(intelligence.whyImportant || whatChanged || whatHappened, 260),
      stillUnknown,
      couldReadersMisunderstand: [...disputed.map(item => `Disputed or needs attribution: ${item}`), ...stillUnknown.map(item => `Unknown: ${item}`)].slice(0, 8),
      whatEvidenceSupportsEachStatement: evidenceMap,
      whatShouldNeverBeInferred: prohibited,
      headlineShouldEmphasize: text(`${whoDidIt || "Primary actor"} ${eventIdentity.primaryAction || ""} ${whatChanged || whatHappened}`, 160),
      leadShouldEmphasize: whatHappened,
      belongsOnlyInBackground: asArray(canonicalIntelligence.context?.previousRelatedEvents).map(item => text(item.title || item.summary || item, 240)).filter(Boolean).slice(0, 6),
      belongsNowhere: prohibited.slice(0, 8)
    },
    evidenceMap,
    decisionInputs: [
      { decisionId: "story-identity", question: "What is the story?", answer: whatHappened, evidenceFactIds: evidenceMap.slice(0, 3).map(item => item.factId) },
      { decisionId: "strongest-evidence", question: "What is the strongest evidence?", answer: evidenceMap[0]?.statement || "", evidenceFactIds: evidenceMap.slice(0, 4).map(item => item.factId) },
      { decisionId: "reader-first", question: "What should the reader know first?", answer: whatHappened, evidenceFactIds: evidenceMap.slice(0, 2).map(item => item.factId) },
      { decisionId: "uncertainty-boundary", question: "What should never be implied?", answer: prohibited.slice(0, 3).join(" | "), evidenceFactIds: [] },
      { decisionId: "headline-reality", question: "What should the headline represent?", answer: text(`${whoDidIt} ${whatChanged}`, 160), evidenceFactIds: evidenceMap.slice(0, 3).map(item => item.factId) }
    ],
    writerGuidance: {
      writerDoesNotResearch: true,
      writerExecutesPlan: true,
      headlineAfterDraft: true,
      noGenericFallback: readiness.articleFormat !== "breaking-brief"
    },
    readiness: {
      readyForReasoning: blockers.length === 0,
      blockers,
      minimumWritingFacts: minimumFacts,
      articleFormat: readiness.articleFormat || ""
    },
    rule: "Story Understanding answers what the dossier means before Writer Reasoning makes drafting decisions."
  };
}

module.exports = { buildStoryUnderstanding };
