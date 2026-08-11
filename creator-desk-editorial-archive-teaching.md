# Creator Desk Editorial Archive Teaching

Created: 2026-08-11

## Problem

Creator Desk editorials must behave like a publication archive. A new daily editorial should not overwrite older published editorials from the same month or year.

## Brain Rule

Use this publication path for every Creator Desk editorial:

1. Generate editorial.
2. Assign a stable unique ID.
3. Add publication metadata.
4. Save as a durable archive record.
5. Update the monthly index.
6. Update the latest-editorial pointer.

The latest editorial is a pointer, not the archive itself.

## Required Metadata

Each published editorial needs:

- `id`
- `date`
- `dayId`
- `title`
- `slug`
- `published`
- `publishedAt`
- `month`
- `monthKey`
- `year`
- `topic`
- `status`

## Replacement Rule

Only replace an existing editorial when the owner explicitly republishes or rewrites that same day. Normal daily generation appends a new archive record and preserves earlier records.

## Why This Matters

The archive gives the Framework historical memory for:

- writing evolution
- repeated theme detection
- engagement analysis
- monthly and yearly retrospectives
- avoiding duplicate editorials
- learning from prior published work

## Verification

- `/api/creator/archive` returns `posts`, `latestEditorial`, and `monthlyIndex`.
- Publishing a new day increases the archive count.
- Republishing the same day updates that day without deleting older days.
- Creator Desk UI still renders from `payload.posts`.
