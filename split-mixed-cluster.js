function splitMixedCluster(sources = []) {
  const groups = new Map();
  sources.forEach(source => {
    const eventId = source.eventSignature?.eventId || source.eventId || source.url || source.title || "unknown-event";
    if (!groups.has(eventId)) groups.set(eventId, []);
    groups.get(eventId).push(source);
  });
  return Array.from(groups.entries()).map(([eventId, group]) => ({ eventId, sources: group }));
}

module.exports = { splitMixedCluster };
