# World Cup Kits

A cultural reference site for World Cup history — every nation's tournament runs documented with photographs and short essays. The squad, the run, the kit, the defining moment.

**Live**: https://world-cup-kits-xi.vercel.app

---

## What's here

Each country page shows every World Cup they've appeared in. Click a year to get a photograph from that tournament and 2–3 story sections covering the context, the run, and what made it memorable. Kit history is part of the story where it matters.

Brazil is the reference implementation with full data across all 23 appearances. Every other nation is a stub — waiting for contributors who know the history.

---

## Contributing

This project is open to contributions. If you know your country's World Cup history, you can add it.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide — what to write, how to find photos, and how to submit.

The short version: each country lives in its own file under `src/data/countries/`. Add a year entry with a photo URL and 2–3 story paragraphs. Submit a PR. You don't need React knowledge — just JavaScript object syntax.

---

## Running locally

```bash
npm install
npm run dev
```

Requires Node 18+. The dev server starts at `http://localhost:5173`.

---

## Tech

- React + Vite (SPA with hash routing)
- Pure CSS — no component library
- One file per country in `src/data/countries/`
- Deployed on Vercel

---

## License

MIT — see [LICENSE](LICENSE).
