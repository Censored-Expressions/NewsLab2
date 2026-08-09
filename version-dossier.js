function versionDossier(dossier = {}) {
  const revision = Number(dossier.revision || 0) + 1;
  return {
    ...dossier,
    revision,
    dossierRevisionId: dossier.dossierRevisionId || `${dossier.eventId || "event"}:revision_${revision}`
  };
}

module.exports = { versionDossier };
