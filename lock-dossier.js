function lockDossier(dossier = {}) {
  return {
    ...dossier,
    dossierLock: {
      active: true,
      revisionId: dossier.dossierRevisionId || `${dossier.eventId || "event"}:locked`,
      lockedAt: new Date().toISOString(),
      rule: "Downstream consumers must reference this locked revision."
    }
  };
}

module.exports = { lockDossier };
