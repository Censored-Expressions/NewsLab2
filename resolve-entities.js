function resolveEntities(claims = []) {
  const text = claims.map(claim => claim.statement || claim).join(" ");
  const names = Array.from(new Set(text.match(/\b[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3}\b/g) || []));
  return {
    people: names.filter(name => !/\b(Inc|Corp|Agency|Department|Court|Team|League)\b/.test(name)).slice(0, 16),
    organizations: names.filter(name => /\b(Inc|Corp|Agency|Department|Court|Team|League|Company|University)\b/.test(name)).slice(0, 16),
    locations: [],
    relationships: []
  };
}

module.exports = { resolveEntities };
