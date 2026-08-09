function cleanText(value = "", max = 240) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeSlug(value = "") {
  return String(value || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "source";
}

function segmentSourceEvents(source = {}, buildEventSignature = null) {
  const title = cleanText(source.title || source.headline || "");
  const summary = cleanText(source.summary || source.articleSummary || source.description || "", 600);
  const text = [title, summary].filter(Boolean).join(" ");
  const parts = [
    ...title.split(/\s+(?:and|while|as|;|\||\/)\s+/i),
    ...text.split(/(?<=[.!?])\s+/)
  ]
    .map(part => cleanText(part, 220))
    .filter(part => part.split(/\s+/).length >= 4)
    .filter(part => /\b(rules?|sues?|charges?|strikes?|wins?|loses?|approves?|blocks?|announces?|investigates?|reports?|confirms?|warns?|launches?|settles?|signs?|passes?|falls?|rises?|beats?)\b/i.test(part))
    .filter((part, index, all) => all.findIndex(item => item.toLowerCase() === part.toLowerCase()) === index)
    .slice(0, 8);
  const segments = parts.map((part, index) => {
    const signature = buildEventSignature
      ? buildEventSignature({ primaryActor: part.split(/\s+/).slice(0, 3).join(" "), primaryAction: "", eventObject: part, source })
      : null;
    const segmentId = `${source.url || source.id || title || "source"}:event_segment_${index + 1}`;
    return {
      segmentId,
      candidateEventId: signature?.eventId || `event:${safeSlug(part)}`,
      title: part,
      eventSignature: signature,
      actorActionObjectTime: {
        actor: signature?.primaryActor || "",
        action: signature?.primaryAction || "",
        object: signature?.eventObject || part,
        time: signature?.eventTimeWindow || source.publishedAt || source.published || ""
      },
      extractionConfidence: signature ? 65 : 55
    };
  });
  const hasMultipleEvents = segments.length >= 2 && new Set(segments.map(item => item.candidateEventId)).size >= 2;
  return {
    active: true,
    version: "20260806-source-event-segmentation-v1",
    hasMultipleEvents,
    segmentCount: segments.length,
    segments,
    rule: "Split source roundups into candidate event segments before clustering so mixed source documents do not create contaminated dossiers."
  };
}

module.exports = { segmentSourceEvents };
