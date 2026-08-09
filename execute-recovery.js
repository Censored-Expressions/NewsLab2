const { classifyRecovery } = require("./classify-recovery");

function executeRecovery(job = {}) {
  return {
    eventId: job.eventId || job.partialDossier?.eventId || "",
    action: job.nextAction || classifyRecovery(job.partialDossier || {}),
    preserveExistingDossier: true,
    rule: "Recovery adds missing intelligence to the retained dossier snapshot."
  };
}

module.exports = { executeRecovery };
