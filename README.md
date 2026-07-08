# World Cup Kits

Kit history, match records, and stories for every nation that has appeared at the FIFA World Cup — 83 countries, 23 tournaments, 1930–2026.

**Live → [world-cup-kits-xi.vercel.app](https://world-cup-kits-xi.vercel.app)**

---

## What it is

A reference archive where each country page covers every World Cup appearance: kit colors, a match-by-match record, and annotated editorial stories for each tournament year. Built around Brazil as the reference implementation (23/23 years, 16 with archival photos) and expanding outward via an autonomous data pipeline.

---

## The pipeline

The interesting part of this project is not the frontend — it's the system that produces the data.

```
queue.json
    │
    ▼
AI research agent  ──→  Wikipedia + Wikimedia Commons
    │                   (stats, match records, kit colors, images)
    ▼
data/countries/*.json   (structured, validated JSON)
    │
    ▼
watch.js                (Node.js file watcher)
    │  ├─ transforms flat JSON → typed JS module
    │  ├─ patches src/data/index.js with new import
    │  └─ git commit + debounced git push
    ▼
GitHub → Vercel         (auto-deploy on push)
    │
    ▼
Production              (world-cup-kits-xi.vercel.app)
```

**How it works:**

1. `queue.json` holds all 83 countries ordered by historical depth and tier (large / medium / small)
2. An AI agent runs on schedule, picks countries off the queue, researches each one from Wikipedia, and writes a structured JSON file per the schema
3. `watch.js` detects the new file, validates structure, converts it to an ES module, patches the import index, auto-commits, and triggers a production deploy
4. The site updates without any manual intervention

The agent processes 1–3 countries per run depending on tier (a country with 13+ World Cup appearances gets its own run; small nations are batched three at a time).

---

## Data schema

Each country file follows a strict schema (`data/schema.json`) enforced at build time:

```json
{
  "id": "argentina",
  "name": "Argentina",
  "confederation": "CONMEBOL",
  "worldCups": [1930, 1978, 1986],
  "stats": { "matches": 88, "wins": 47, "draws": 17, "losses": 24 },
  "facts": [{ "id": "albiceleste", "label": "THE ALBICELESTE", "story": "..." }],
  "kits": {
    "1986": {
      "result": "Champions",
      "headline": "The Hand of God",
      "annotations": [
        { "id": "hand-of-god",  "label": "THE HAND OF GOD",     "story": "..." },
        { "id": "the-kit",      "label": "THE LE COQ KIT",      "story": "..." },
        { "id": "the-context",  "label": "AFTER THE FALKLANDS", "story": "..." }
      ],
      "homeColors": "light blue and white stripes",
      "image": "https://commons.wikimedia.org/...",
      "matches": [{ "round": "Group Stage", "opponent": "South Korea", "score": "3–1", "result": "W" }]
    }
  }
}
```

**Build-time validation** (`scripts/validate.js`, runs as `prebuild`) catches:
- `stats.matches ≠ wins + draws + losses`
- Invalid confederation / result / W-D-L values
- 2026 in `worldCups` (schema excludes the current tournament)
- Hyphens instead of en-dashes in scores
- Non-URL image strings

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite 8 |
| Routing | React Router v7 (HashRouter) |
| Styling | Vanilla CSS — custom design system, no framework |
| Data | Pipeline-generated ES modules |
| Watcher | Node.js `fs.watch` |
| Deploy | Vercel (auto-deploy on every data push) |
| Fonts | Barlow + Barlow Condensed (Google Fonts) |
| Flags | flagcdn.com |
| Kit photos | Wikimedia Commons (CC-licensed) |

---

## Running locally

```bash
git clone https://github.com/moff05/world-cup-kits.git
cd world-cup-kits
npm install
npm run dev          # Vite dev server → localhost:5176
```

To run the data watcher (converts new JSON → JS and auto-deploys):

```bash
npm run watch:data
```

To validate all country JSON files:

```bash
npm run validate
```

To deploy:

```bash
npm run deploy
```

---

## Project structure

```
world-cup-kits/
├── data/
│   ├── countries/          # Source JSON files (agent writes here)
│   ├── cowork-prompt.md    # Agent instructions + research protocol
│   └── schema.json         # Canonical data schema with field rules
├── scripts/
│   └── validate.js         # Build-time data integrity checker
├── src/
│   ├── data/
│   │   ├── countries/      # Generated JS modules (watch.js writes here)
│   │   └── index.js        # Auto-patched import registry
│   ├── pages/
│   │   ├── Home.jsx               # Confederation grid + search/filter
│   │   ├── CountryDashboard.jsx   # Per-country history + accordion
│   │   └── KitView.jsx            # Individual year — photo, annotations, matches
│   └── App.css             # Full design system
├── watch.js                # Pipeline: JSON → JS module → git → Vercel
└── queue.json              # 83-country processing queue with tier + status
```

---

## Status

19 / 83 countries have full data. The pipeline processes the remainder autonomously — each new country auto-deploys to production within ~30 seconds of the agent writing its file.
