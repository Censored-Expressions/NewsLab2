function dossierLifecycle(eventId = "", stages = []) {
  return {
    eventId,
    stages,
    currentStage: stages[stages.length - 1]?.stage || "",
    rule: "Trace the dossier from source intake through recovery, lock, downstream consumption, and public publication."
  };
}

module.exports = { dossierLifecycle };
