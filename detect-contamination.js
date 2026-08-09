function detectContamination(signatures = []) {
  const actionCount = new Set(signatures.map(item => item.primaryAction).filter(Boolean)).size;
  const actorCount = new Set(signatures.map(item => item.primaryActor).filter(Boolean)).size;
  const objectCount = new Set(signatures.map(item => item.eventObject).filter(Boolean)).size;
  const timeCount = new Set(signatures.map(item => item.eventTimeWindow).filter(Boolean)).size;
  const eventCount = new Set(signatures.map(item => item.eventId).filter(Boolean)).size;
  const contaminationScore = Math.min(1, Math.max(0, (Math.max(0, actionCount - 1) + Math.max(0, actorCount - 2) + Math.max(0, eventCount - 1)) / 6));
  const components = {
    actorConsistency: Number(Math.max(0, 1 - Math.max(0, actorCount - 1) * 0.28).toFixed(2)),
    actionCompatibility: Number(Math.max(0, 1 - Math.max(0, actionCount - 1) * 0.34).toFixed(2)),
    timelineCompatibility: Number(Math.max(0, 1 - Math.max(0, timeCount - 1) * 0.18).toFixed(2)),
    objectConsequenceConsistency: Number(Math.max(0, 1 - Math.max(0, objectCount - 1) * 0.2).toFixed(2)),
    competingEventCenters: Math.max(0, eventCount - 1)
  };
  return {
    contaminationScore,
    eventCoherence: Number((1 - contaminationScore).toFixed(2)),
    coherenceAnalysis: {
      components,
      warnings: [
        components.actorConsistency < 0.8 ? "actor-inconsistency-detected" : "",
        components.actionCompatibility < 0.8 ? "action-incompatibility-detected" : "",
        components.timelineCompatibility < 0.75 ? "timeline-incompatibility-detected" : "",
        components.competingEventCenters > 0 ? "competing-event-centers-detected" : ""
      ].filter(Boolean),
      decision: contaminationScore <= 0.2 ? "write" : contaminationScore <= 0.4 ? "split-or-repair" : "hold"
    },
    readyForWriting: contaminationScore <= 0.2
  };
}

module.exports = { detectContamination };
