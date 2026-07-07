# Contributing to World Cup Kits

Thanks for contributing. This site is built on the idea that fans who lived through their country's World Cup runs know details that no single author could capture. If you know the history, here's how to add it.

---

## What makes a good contribution

Each year entry tells the story of one country's run at one World Cup. You're aiming for:

- **A photograph** from that tournament (match action, team photo, or a well-known moment)
- **2–3 story sections** covering: the squad/context going in, the tournament itself, and the defining moment or legacy
- **Optional kit note** — if the jersey has a story worth telling, add it as one of the sections

Write like a fan who knows the detail, not like a Wikipedia article. Specific > general. "Leônidas scored a bicycle kick in driving rain against Poland" beats "Brazil had a strong attacking performance."

---

## Adding a year to an existing country

1. **Fork the repo** and clone it locally
2. Open the country's file: `src/data/countries/<country-id>.js` (e.g. `src/data/countries/argentina.js`)
3. Add an entry inside the `kits` object using this shape:

```js
kits: {
  1986: {
    headline: "The Hand of God",
    kits: {
      home: {
        image: "https://upload.wikimedia.org/wikipedia/commons/...",
        imageBg: null,         // optional: CSS color for image background, e.g. "#1a3a6e"
        imageCredit: {
          player: "Diego Maradona",                              // or null
          game: "Argentina vs England, Quarter-final — 1986 FIFA World Cup, Mexico City. CC BY-SA 2.0.",
        },
        annotations: [
          {
            id: "hand-of-god",
            label: "The Hand of God",
            story: "Four minutes into the second half, Maradona punched the ball into the net with his left hand. The referee didn't see it. England did. 'A little with the head of Maradona and a little with the hand of God,' he said afterwards. It remains one of the most debated moments in sporting history.",
          },
          {
            id: "goal-of-century",
            label: "The Goal of the Century",
            story: "Six minutes after the hand ball, Maradona picked up the ball in his own half, ran 60 metres, beat five England players and the goalkeeper, and scored. FIFA later voted it the Goal of the Century. Both goals came in the same half, against the same opponent, within six minutes of each other.",
          },
          {
            id: "the-kit",
            label: "The Le Coq Sportif Era",
            story: "Argentina wore Le Coq Sportif in 1986 — a French brand that dressed them from 1982 through the late 1980s. The sky blue and white stripes were thinner than the Adidas versions that came before and after. The shirt is now considered one of the most iconic in World Cup history.",
          },
        ],
      },
    },
  },
}
```

4. Run `npm run dev` locally and check that the year appears correctly on the country page and kit view
5. Run `npm run build` to confirm no build errors
6. Submit a pull request

---

## Finding a photograph

Use **Wikimedia Commons** (commons.wikimedia.org) — it's the best source of freely licensed historical football photography.

Good search queries:
- `"1986 FIFA World Cup" Argentina`
- `Maradona 1986 quarter-final`
- `Category:1986 FIFA World Cup`

**What to look for**: action shots from the match, team photos, or iconic moments. The image doesn't need to show the kit perfectly — any compelling photo from that tournament year works.

**Licenses to use**: Public domain, CC BY, CC BY-SA. Avoid images that are "All rights reserved" or have no license listed.

**How to get the URL**: On the file page, right-click the full-resolution image and copy the image URL. It will look like:
`https://upload.wikimedia.org/wikipedia/commons/...`

**In `imageCredit`**: write the player name (or null), then the match, tournament, location, and license — e.g.:
`"Argentina vs England, Quarter-final — 1986 FIFA World Cup, Mexico City. CC BY-SA 2.0."`

---

## Adding a new country

If a country isn't in the repo yet, you can add it:

1. Create `src/data/countries/<country-id>.js` — use the same format as an existing file
2. Add an import and entry to `src/data/index.js`
3. Make sure `flagCode` is the two-letter ISO 3166-1 alpha-2 code (used to load the flag image from flagcdn.com)
4. Add at least one year entry with real content before submitting

```js
// src/data/countries/germany.js
export const germany = {
  id: "germany",
  name: "Germany",
  flagCode: "de",
  confederation: "UEFA",
  worldCups: [1934, 1938, 1954, 1958, ...],
  facts: [
    // Optional: 1-2 kit tradition facts (things that are true across multiple years)
    {
      id: "adidas-home",
      label: "The Adidas Partnership",
      story: "Germany has worn Adidas at every World Cup since 1954 — the longest continuous kit partnership in the tournament's history. Adi Dassler himself attended the 1954 final in Bern.",
    },
  ],
  kits: {
    1954: {
      // ...
    },
  },
};
```

---

## Data field reference

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Lowercase, hyphenated. Must match filename and import key. |
| `name` | Yes | Display name |
| `flagCode` | Yes | ISO 3166-1 alpha-2 (e.g. `"de"`, `"br"`, `"us"`) |
| `confederation` | Yes | `"UEFA"`, `"CONMEBOL"`, `"CONCACAF"`, `"CAF"`, `"AFC"`, `"OFC"` |
| `worldCups` | Yes | Array of years the country participated |
| `facts` | No | Country-level kit traditions, true across multiple years |
| `kits[year].headline` | Yes | One punchy line — the story of that year in ~6 words |
| `kits[year].kits.home.image` | Yes | Wikimedia URL, or `null` if no photo found yet |
| `kits[year].kits.home.imageBg` | No | CSS color string for the image container background |
| `kits[year].kits.home.imageCredit` | If image | `{ player, game }` — player can be `null` |
| `kits[year].kits.home.annotations` | Yes | Array of story sections (see above) |
| `annotations[].id` | Yes | Unique string within this year |
| `annotations[].label` | Yes | Section heading (displayed in gold) |
| `annotations[].story` | Yes | 2–5 sentences. Specific. No padding. |

---

## What not to do

- **Don't copy from Wikipedia** — write it in your own words, or don't submit it
- **Don't add placeholder text** — if you don't know the story yet, leave the year out
- **Don't invent details** — if you're unsure of a fact, don't include it
- **Don't use images you don't have rights to** — only Wikimedia CC/public domain
- **Don't submit a year with `image: null` and no annotations** — that's an empty stub

---

## Questions

Open an issue if you're unsure about anything before spending time on a contribution. Better to ask first.
