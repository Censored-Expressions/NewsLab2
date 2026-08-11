# Dossier Source Of Truth Contract

Version: 20260809-dossier-source-of-truth-v1

## Owner Intent
The Story Dossier must become the single source of truth for every downstream subsystem.

Required flow:

Feeds -> Evidence Collection -> Canonical Event -> Story Dossier -> Knowledge Graph -> Understanding -> Writer Reasoning -> Headline Intelligence -> Editorial -> Images -> Publication

## Rule
Downstream systems may not rebuild event context independently from RSS titles, source fragments, repair memory, image terms, or category labels once a canonical dossier revision exists.

Each downstream system must consume and record the same:

- canonicalEventId
- dossierRevisionId
- Story Understanding ID
- Writer Reasoning Plan ID
- controllingObject: `canonicalDossierIntelligence`

## Why This Matters
Using one canonical dossier revision prevents:

- mixed stories
- mismatched headlines
- incorrect lead paragraphs
- unrelated images
- repeated repair loops
- stale or conflicting category decisions

## Required Consumer Proof
Each story should carry a `dossierSourceOfTruthContract` showing whether these consumers used the same dossier revision:

- Evidence Collection
- Knowledge Graph
- Understanding
- Writer Reasoning
- Headline Intelligence
- Editorial
- Images
- Publication

## Enforcement
If any required consumer does not consume the canonical dossier revision, its output should be held, repaired, or regenerated from the dossier. It should not recreate context from source headlines or feed fragments.

## Operating Standard
Project 3, Story Dossier, and Project 4, Writer Reasoning, are the intelligence core. Creator Desk, Newsletter, Image Intelligence, Search, Sports Intelligence, and future applications should consume the same canonical understanding instead of reconstructing their own.
