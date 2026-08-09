function normalizeSource(source = {}) {
  return {
    sourceId: source.sourceId || source.id || source.url || source.title || "",
    title: String(source.title || source.headline || "").trim(),
    summary: String(source.summary || source.articleSummary || source.description || "").trim(),
    source: String(source.source || source.name || source.publisher || "").trim(),
    url: source.url || source.sourceUrl || "",
    publishedAt: source.publishedAt || source.published || source.date || "",
    categoryHint: source.category || source.tab || ""
  };
}

module.exports = { normalizeSource };
