const eventSignatureSchema = {
  required: ["primaryActor", "primaryAction", "eventObject", "eventTimeWindow", "eventStatus"],
  optional: ["location", "consequence", "sourceSegmentId", "candidateEventId", "categoryHint", "evidenceBackedFields"],
  mergeRule: "Merge only when actor, action, time window, and object or consequence substantially agree.",
  evidenceRule: "Actor, action, object, time, location, consequence, and status should be represented as evidence-backed fields with confidence, sourceIds, independentSourceCount, and status."
};

module.exports = { eventSignatureSchema };
