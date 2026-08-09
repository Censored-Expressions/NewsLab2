function detectContradictions(claims = []) {
  return claims.filter(claim => /contradict|dispute|unclear|conflict|unconfirmed/i.test(claim.statement || claim));
}

module.exports = { detectContradictions };
