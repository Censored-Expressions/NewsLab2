class DossierRepository {
  constructor(store = new Map()) {
    this.store = store;
  }

  save(dossier = {}) {
    const key = dossier.dossierRevisionId || dossier.eventId || dossier.dossierId;
    if (!key) throw new Error("dossier-repository-missing-key");
    this.store.set(key, dossier);
    return dossier;
  }

  get(key) {
    return this.store.get(key) || null;
  }
}

module.exports = { DossierRepository };
