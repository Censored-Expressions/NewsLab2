const claimSchema = {
  required: ["factId", "eventId", "statement", "sourceIds", "verificationStatus", "writingEligible"],
  optional: ["actor", "action", "object", "time", "location", "independentSourceCount"],
  writerRule: "The Writer may use only writingEligible claims tied to the locked eventId."
};

module.exports = { claimSchema };
