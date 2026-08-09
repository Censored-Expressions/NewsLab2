function buildTimeline(sources = []) {
  return sources
    .filter(source => source.publishedAt || source.published || source.title)
    .slice(0, 12)
    .map((source, index) => ({
      id: `timeline_${index + 1}`,
      at: source.publishedAt || source.published || "",
      title: source.title || source.summary || "",
      source: source.source || "",
      url: source.url || ""
    }));
}

module.exports = { buildTimeline };
