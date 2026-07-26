# Editorial Cluster Integrity Teaching

Date: 2026-06-25
Target: Creator Desk, News Lab, Article Intelligence, Editorial Learning

## Problem Detected
Owner review found that story clusters could mix unrelated events, copied RSS preview fragments could leak into public writing, and editorials could apply a generic opinion frame to facts that did not support it.

## Brain Rule
Before publishing a generated article, editorial, newsletter item, or story tile, the Brain must verify that every supporting article belongs to the same news event as the representative story. Do not combine stories just because they share an outlet digest, category, broad keyword, or RSS entry.

## Required Checks
- Compare category, identity terms, named entities, and title/summary overlap before grouping stories.
- Reject mixed digest items that contain several unrelated headlines inside one RSS summary.
- Use only complete sentences from source summaries.
- Treat ellipses, mojibake, tracking code, JavaScript snippets, clipped words, or sentence fragments as unsafe evidence.
- Rewrite facts in Censored Expressions wording. Do not paste article previews into public output.
- Allow opinion only in Creator Desk/editorial/newsletter contexts, and tie that opinion to the actual facts of the chosen story.
- Keep factual News Lab articles separate from opinion/editorial language.

## Verification Pattern
After a rewrite or generation cycle, verify:
- Bad fragment count is zero.
- Template phrase count is zero.
- Supporting stories either pass same-event checks or are removed.
- Public copy contains complete sentences and no tracking/source-code artifacts.
- The proof log records the owner feedback, Brain action, and rewrite result.

## Reusable Patch Lesson
When the Brain sees repeated owner feedback about mixed stories, copied snippets, partial sentences, generic opinions, or mismatched story frames, it should update the clustering and polishing code first, then rewrite the affected archive. Recording the lesson without changing the public output is incomplete execution.
