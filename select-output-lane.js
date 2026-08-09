const { evaluateIntegrity } = require("./evaluate-integrity");
const { evaluateDepth } = require("./evaluate-depth");

function selectOutputLane(dossier = {}) {
  const integrity = evaluateIntegrity(dossier);
  if (!integrity.ready) return { lane: "recovery", integrity };
  const depth = evaluateDepth(dossier);
  return { lane: depth.articleFormat, integrity, depth };
}

module.exports = { selectOutputLane };
