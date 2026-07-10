# Backfill Prompt — World Cup Kits Gap Filler

This prompt fixes existing country files. It does NOT write countries from scratch.
Two specific gaps to fill — nothing else should be touched.

---

## Step 1: Pick countries to process this run

Read `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/queue.json`.

Find entries with `"status": "backfill"`. Check the `tier` of the first one:
- `"large"` (13+ World Cups) → do **1 country** this run
- `"medium"` (7–12 World Cups) → do **2 countries** this run
- `"small"` (1–6 World Cups) → do **4 countries** this run

Process in order — first backfill = highest priority.

---

## Step 2: For each country, read the existing file

Open `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/countries/[country-id].json`.

Scan it for two types of gaps:

### Gap A — Missing scorers
A match has a gap if:
- The `scorers` field is absent, or
- `scorers` is `null`

**AND** the match had at least one goal scored by this country (i.e. their score in the result isn't 0).

Matches where this country scored 0 goals should stay `null` — they're correct.

### Gap B — Missing annotations
A year has a gap if its `annotations` array has fewer than 3 items.

If a year has 0 or 1 annotations, it was written before the 3-annotation rule and needs the missing angles added.

**If a country has no gaps in either category — skip it entirely and mark it `"done"` in queue.json.**

---

## Step 3: Fill Gap A — Scorers

For each match with a missing scorer where this country scored ≥ 1 goal:

Search: **"[Country] v [Opponent] [YEAR] FIFA World Cup" site:en.wikipedia.org**

From the match page, extract **this country's goal scorers only**:
- Format: `"Surname Minute'"` e.g. `"Müller 12', Haller 67'"`
- Own goals by the opponent: `"Surname OG 45'"`
- Penalty shootout goals: do NOT list individual shootout scorers — only regulation + extra time goals
- If the page doesn't clearly list scorers with minutes: leave `null` — **never guess a name or minute**

Fill the `scorers` field in the JSON. Do not change the `round`, `opponent`, `score`, or `result`.

---

## Step 4: Fill Gap B — Annotations

For years with fewer than 3 annotations, add the missing angles. The 3 required angles are:

1. **The result / key moment** — the defining match or player moment of that tournament
2. **The kit** — something specific and visual: colors, badge, sponsor, design detail, what made it distinctive
3. **The context** — a political, cultural, or off-pitch story from that tournament for this country

Check which angles are already covered by existing annotation `id` and `label` values. Only write the missing ones — do not rewrite annotations that already exist.

**Writing rules (same as main prompt):**
- `id`: kebab-case slug
- `label`: 2–4 words ALL CAPS
- `story`: 30–60 words. One specific moment, one specific detail. Magazine voice.
- If you could find the sentence on Wikipedia verbatim, rewrite it.
- Never "the team showed resilience." Never "played a pivotal role."

For research: **"[Country] [YEAR] FIFA World Cup" site:en.wikipedia.org** plus the kit colors/history search from the main prompt's Source C and Source E.

---

## Step 5: Write the file back

Write the updated JSON to the **same path**: `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/countries/[country-id].json`

Rules:
- Keep every existing field exactly as-is unless you are filling a gap
- Do not reformat, reorder, or rewrite anything that wasn't a gap
- Do not change any score, result, headline, or existing annotation
- The watcher will pick up the file and rebuild automatically

---

## Step 6: Update the queue

After each country is written, set its `"status"` from `"backfill"` to `"done"` in `queue.json`.

---

## What NOT to do

- Do not rewrite existing annotations — only add missing angles
- Do not change any match data that is already filled in
- Do not guess scorers — `null` is always correct when you can't verify
- Do not list individual penalty shootout scorers
- Do not add 2026 data
- Do not change scores, results, headlines, or kit colors that are already present
