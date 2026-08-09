# Sports Intelligence v2 Teaching

Version: 20260808-sports-market-dossier-v2

## Owner Intent
Sports Intelligence should move beyond a manual prediction form into a Market Dossier and Bet Intelligence engine. Visitors should be able to search for events and markets such as `Celtics vs Knicks`, `Yankees moneyline`, `Chiefs -3.5`, or `Over 8.5 runs`, and the Framework should normalize the request before producing analysis.

## Core Rule
Do not think in sportsbook rows. Think in canonical events and canonical markets.

Flow:
Sportsbook offers -> canonical event -> canonical market -> evidence dossier -> sports understanding -> sports reasoning -> probability model -> market comparison -> confidence and uncertainty -> visitor analysis.

## Canonical Market Object
Every searched market should resolve toward:

```json
{
  "eventId": "nba_20260808_nyk_bos",
  "marketType": "spread",
  "participant": "NYK",
  "line": 4.5,
  "period": "full_game"
}
```

## Evidence Buckets
Evidence must be separated before reasoning:

- SUPPORTS BET
- OPPOSES BET
- NEUTRAL
- UNKNOWN
- STALE DATA
- CONFLICTING DATA

## Reasoning Requirements
Market types require different reasoning:

- Moneyline: win probability, starters, injuries, form, venue, rest/travel, matchup strength.
- Spread: margin distribution, pace, injuries, matchup pressure, backdoor-cover risk.
- Total: scoring environment, pace, weather, pitcher/goaltender/quarterback context, offensive efficiency.
- Player prop: role, minutes/snaps/usage, matchup, injury context, pace, historical opportunity.

## Probability And Confidence
Probability and confidence are separate.

Probability estimates how often the selection should occur. Confidence estimates how much the Framework trusts the evidence behind that estimate.

## Provider Boundary
Do not scrape sportsbooks directly. Use licensed odds/data aggregators when the project is ready for live sportsbook data. ESPN and similar outlets may support stats, news, and injury context, but sportsbook odds should come from licensed odds providers.

## Classification
Use these visitor-facing classes:

- STRONG MODELED EDGE
- MODERATE MODELED EDGE
- SMALL MODELED EDGE
- MARKET ALIGNED
- NEGATIVE MODELED EDGE
- INSUFFICIENT DATA
- HIGH UNCERTAINTY

## Calibration
Every saved forecast freezes the original modeled probability and is scored later against the actual outcome using Brier score, hit rate, and calibration buckets.
