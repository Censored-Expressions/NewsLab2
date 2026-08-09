function evidenceBackedField(value = "", field = "", source = {}) {
  const cleanValue = String(value || "").trim();
  const sourceId = source.sourceId || source.id || source.url || source.source || "";
  return {
    value: cleanValue,
    confidence: cleanValue ? Number(source.confidence || 0.7) : 0,
    sourceIds: sourceId ? [String(sourceId).slice(0, 220)] : [],
    independentSourceCount: sourceId ? 1 : 0,
    status: cleanValue ? "source-backed" : "missing",
    field
  };
}

function buildEventSignature({ primaryActor = "", primaryAction = "", eventObject = "", eventTimeWindow = "", location = "", consequence = "", eventStatus = "active", source = {} } = {}) {
  const eventId = ["event", primaryActor, primaryAction, eventObject || consequence, eventTimeWindow, location]
    .filter(Boolean)
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9:]+/g, "-")
    .slice(0, 160);
  return {
    primaryActor,
    primaryAction,
    eventObject,
    eventTimeWindow,
    location,
    consequence,
    eventStatus,
    eventId,
    evidenceBackedFields: {
      actor: evidenceBackedField(primaryActor, "actor", source),
      action: evidenceBackedField(primaryAction, "action", source),
      object: evidenceBackedField(eventObject, "object", source),
      time: evidenceBackedField(eventTimeWindow, "time", source),
      location: evidenceBackedField(location, "location", source),
      consequence: evidenceBackedField(consequence, "consequence", source),
      status: evidenceBackedField(eventStatus, "eventStatus", source)
    }
  };
}

module.exports = { buildEventSignature, evidenceBackedField };
