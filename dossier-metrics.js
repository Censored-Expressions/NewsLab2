function dossierMetrics(dossiers = []) {
  const total = dossiers.length;
  const ready = dossiers.filter(dossier => dossier.readiness?.readyForWriter || dossier.readiness?.ready).length;
  const contaminated = dossiers.filter(dossier => Number(dossier.contaminationCheck?.contaminationScore || 0) > 0.2).length;
  return {
    total,
    ready,
    readyRate: Number((ready / Math.max(1, total)).toFixed(2)),
    contaminated,
    contaminationRate: Number((contaminated / Math.max(1, total)).toFixed(2))
  };
}

module.exports = { dossierMetrics };
