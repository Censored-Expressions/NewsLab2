function buildEntityGraph(entities = {}) {
  return {
    people: entities.people || [],
    organizations: entities.organizations || [],
    locations: entities.locations || [],
    relationships: entities.relationships || []
  };
}

module.exports = { buildEntityGraph };
