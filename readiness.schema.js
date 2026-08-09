const readinessSchema = {
  integrityStates: ["ready", "needs-identity-resolution", "needs-cluster-repair", "needs-evidence"],
  depthStates: ["developing-brief", "standard-article", "deep-article"],
  routingRule: "Integrity decides safe-to-write; depth decides article length."
};

module.exports = { readinessSchema };
