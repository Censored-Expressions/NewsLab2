const { selectOutputLane } = require("../readiness/select-output-lane");

function rescoreDossier(dossier = {}) {
  return selectOutputLane(dossier);
}

module.exports = { rescoreDossier };
