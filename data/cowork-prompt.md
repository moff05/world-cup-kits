# Cowork Prompt — World Cup Kits Data Pipeline

## Step 1: Decide how many countries to do this run

Read `/Users/nmoff/Desktop/Claude Projects/world-cup-kits/queue.json`.

Find pending countries and check the `tier` of the first one:
- `"large"` (13+ World Cups) → do **1 country** this run
- `"medium"` (7–12 World Cups) → do **2 countries** this run  
- `"small"` (1–6 World Cups) → do **3 countries** this run

Process them in order. First pending = highest priority.

---

## Step 2: For each country, gather data from these sources in this exact order

### Source A — Overall record + tournament list
Search: **"[Country name] at the FIFA World Cup" site:en.wikipedia.org**

From this page, extract:
- Every World Cup year they participated in (1930–2022 only, ignore 2026)
- Their result each year (e.g. Champions, Quarter-final, Group Stage)
- Overall totals: matches played, wins, draws, losses, goals for, goals against

### Source B — Match-by-match data
For each tournament year, search: **"[Country] [YEAR] FIFA World Cup" site:en.wikipedia.org**

From each tournament page, extract every single match:
- Round (Group Stage / Round of 16 / Quarter-final / Semi-final / Final / 3rd Place / 2nd Round)
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

The 3 annotations must cover 3 different angles — do not write 3 variations of the same topic:
1. **The result / key moment** — what happened on the pitch, the defining match or player
2. **The kit** — something specific and visual about what they wore that year (colors, badge, sponsor, design detail)
3. **The context** — a political, cultural, or off-pitch story that made that tournament unique for this country

**Strict field limits:**
- `headline`: 3–6 words
- Each `annotation.story`: 30–60 words
- `facts[].story`: 60–90 words each

**Writing test:** If you could find the sentence on Wikipedia verbatim, rewrite it. Sports Illustrated voice — vivid, specific, surprising. Never "the team showed resilience." Never "played a pivotal role."

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
