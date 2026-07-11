# Cowork Prompt — World Cup Kits Data Pipeline

## Step 1: Decide what to do this run

Read `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/queue.json`.

**If any entries have `"status": "pending"`** → run the main pipeline (Steps 2–5 below).

**If no `"pending"` entries remain but some have `"status": "backfill"`** → skip to the [Backfill Phase](#backfill-phase) at the bottom of this file.

**If neither pending nor backfill entries exist** → nothing to do, stop.

### Main pipeline: how many countries per run
Check the `tier` of the first pending entry:
- `"large"` (13+ World Cups) → do **1 country** this run
- `"medium"` (7–12 World Cups) → do **2 countries** this run  
- `"small"` (1–6 World Cups) → do **3 countries** this run

Process them in order. First pending = highest priority.

---

## Step 2: For each country, gather data from these sources in this exact order

### Source A — Overall record + tournament list
Search: **"[Country name] at the FIFA World Cup" site:en.wikipedia.org**

From this page, extract:
- Every World Cup year they participated in (1930–2026)
- Their result each year (e.g. Champions, Quarter-final, Group Stage, Round of 32)
- Overall totals: matches played, wins, draws, losses, goals for, goals against

**2026 World Cup note:** The 2026 tournament uses a 48-team format with a Round of 32 knockout round after the group stage. Valid 2026 result values: `Group Stage`, `Round of 32`, `Round of 16`, `Quarter-final`, `Semi-final`, `Runners-up`, `Champions`. Search "2026 FIFA World Cup" to get current results — the tournament may still be in progress.

**If a country is still active in the 2026 tournament (not yet eliminated):** add their completed matches to `matches[]` and set `result` to their current furthest stage, but leave `headline` and `annotations` as `null` — do not write their story until their run is complete.

### Source B — Match-by-match data
For each tournament year, search: **"[Country] [YEAR] FIFA World Cup" site:en.wikipedia.org**

From each tournament page, extract every single match:
- Round (Group Stage / Round of 32 / Round of 16 / Quarter-final / Semi-final / Final / 3rd Place / 2nd Round)
- Opponent name as they were known at the time
- Score using en-dash: `2–1`. Penalty shootouts: `1–1 (4–2 pens)`
- Result: W / D / L — **penalty shootout matches are always D, never W or L**
- Scorers: **this country's goal scorers only**, with minute. Format: `"Pelé 18', Jairzinho 71'"`. Own goals: `"Mazzola OG 45'"`. Set to null if not found on the page — never guess.

### Source C — Kit colors
Search: **"[Country] national football team kit [decade]" site:en.wikipedia.org** OR **"[Country] [YEAR] FIFA World Cup kit"**

Extract home and away colors for each tournament year. If not findable for a specific year, describe the era's known colors or set to null.

### Source D — Images
Search Wikimedia Commons: **commons.wikimedia.org/wiki/Category:[YEAR]_FIFA_World_Cup**

Find one freely-licensed (CC BY, CC BY-SA, or public domain) match photo featuring this country. Must be a real, verified URL. Set to null if nothing suitable found.

### Source E — Kit traditions
Search: **"[Country] national football team history kit" site:en.wikipedia.org**

Find 2 specific, interesting facts about the country's kit history or football identity. Must be verifiable from the source.

---

## Step 3: Verify before writing

Run this checklist. Fix any discrepancy before writing the file.

- [ ] **Math check:** wins + draws + losses = total matches. If not, recheck Source B.
- [ ] **Penalty check:** every match that went to a shootout has result "D"
- [ ] **Opponent name check:** pre-1991 Germany → "West Germany", pre-1991 Russia → "Soviet Union", pre-2006 Serbia → "Yugoslavia" or "Serbia and Montenegro", pre-1997 Congo → "Zaire", pre-1993 Czech Republic → "Czechoslovakia"
- [ ] **Score format:** en-dash only (`2–1` not `2-1`)
- [ ] **No 2026 data**
- [ ] **Image URL:** tested and resolves to a real Wikimedia Commons file, or is null

---

## Step 4: Write the output

Schema: `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/schema.json`

**Per year, write exactly 3 annotations. Never fewer. This is the minimum.**

Each annotation has:
- `id`: kebab-case slug (e.g. `"hand-of-god"`, `"the-kit"`, `"the-result"`)
- `label`: 2–4 words ALL CAPS (e.g. `"THE HAND OF GOD"`, `"THE KIT"`, `"HOW IT ENDED"`)
- `story`: 30–60 words. One specific moment, one specific detail. Magazine voice.

The 3 annotations must cover 3 genuinely different angles. Read all 3 together before finalizing — if they could be mistaken for variations on the same topic, they are wrong:
1. **The result / key moment** — what happened on the pitch, the defining match or player. A specific score, a specific minute, a specific name.
2. **The kit** — something specific and visual: colors, badge detail, shirt number style, sponsor, a manufacturing story, a kit swap. Not "they wore yellow." A fact someone wouldn't already know.
3. **The context** — a political, cultural, economic, or off-pitch story that made that tournament unique for this country. If the country had no significant context, find a player biography angle, a travel story, or a stadium detail.

**Self-check before writing:** Label each annotation with its angle (moment / kit / context). If two share an angle, replace one. If all three are about match results, start over.

**Strict field limits:**
- `headline`: 3–6 words
- Each `annotation.story`: 30–60 words
- `facts[].story`: 60–90 words each

**Writing test:** If you could find the sentence on Wikipedia verbatim, rewrite it. Sports Illustrated voice — vivid, specific, surprising. Never "the team showed resilience." Never "played a pivotal role." Never open with the country name.

Output file: `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/countries/[country-id].json`

---

## Step 5: Update the queue

After all files are written, open `queue.json` and set each processed country's `"status"` from `"pending"` to `"done"`.

---

## What NOT to do (token waste)

- Do not read sources beyond A–E listed above
- Do not write more than the word limits specify
- Do not attempt to verify image URLs by downloading images — just confirm the URL path resolves on commons.wikimedia.org
- Do not include 2026 data under any circumstance
- Do not guess any score, stat, or URL — set to null instead

---

## Backfill Phase

Only enter this phase when there are zero `"pending"` entries and at least one `"backfill"` entry.

### How many to process per backfill run
Check the `tier` of the first `"backfill"` entry:
- `"large"` (13+ World Cups) → do **1 country** this run
- `"medium"` (7–12 World Cups) → do **2 countries** this run
- `"small"` (1–6 World Cups) → do **4 countries** this run

### What to fix

Open `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/countries/[country-id].json` for each country.

Scan for two types of gaps:

**Gap A — Missing scorers**
A match needs a scorer fill if:
- The `scorers` field is absent or `null`, AND
- This country scored ≥ 1 goal in that match (their half of the score is > 0)

Matches where this country scored 0 goals: leave `null`, they are correct.

**Gap B — Missing annotations**
A year needs annotation fill if its `annotations` array has fewer than 3 items.

**Important:** A `story` string field is NOT an annotation. Only items inside the `annotations` array count. A year with `"story": "..."` and `"annotations": []` has 0 annotations and needs all 3 written. A year with 1 item in `annotations` needs 2 more written. Do not count `story` toward the 3-annotation requirement.

If a country has no gaps in either category — mark it `"done"` immediately and move to the next backfill entry.

### How to fill Gap A — Scorers

Search: **"[Country] v [Opponent] [YEAR] FIFA World Cup" site:en.wikipedia.org**

Extract **this country's goal scorers only** with minute:
- Format: `"Müller 12', Haller 67'"`
- Own goals by the opponent: `"Surname OG 45'"`
- Do NOT list individual penalty shootout scorers — regulation + extra time only
- If the page doesn't clearly list scorers with minutes: leave `null` — never guess

### How to fill Gap B — Annotations

The 3 required angles are:
1. **The result / key moment** — the defining match or player moment of that tournament
2. **The kit** — something specific and visual: colors, badge, sponsor, design detail
3. **The context** — a political, cultural, or off-pitch story from that tournament

Count the items already in `annotations[]`. Write exactly `3 - current_count` new items to bring the total to 3. Check existing `id` and `label` values to see which angles are already covered, and write only the missing angles. Never rewrite annotations that already exist.

Example: if `annotations` has 1 item covering "the result", write 2 new annotations covering "the kit" and "the context".

Same writing rules as main pipeline: 30–60 words per annotation, magazine voice, no Wikipedia verbatim, no "showed resilience."

### Writing the file back

Write to the **same path**: `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/data/countries/[country-id].json`

- Keep every existing field exactly as-is unless filling a gap
- Do not reformat, reorder, or rewrite anything that was not a gap
- Do not change any score, result, headline, or existing annotation
- The watcher will auto-commit and deploy

### Updating the queue after backfill

Set each processed country's `"status"` from `"backfill"` to `"done"` in `queue.json`.
