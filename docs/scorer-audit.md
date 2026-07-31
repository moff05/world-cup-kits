# Scorer Data Audit

Matches with goals scored but no scorer data.

**Status: resolved.** The previous version of this doc flagged 398 "gaps" across 78 countries, but that check was buggy — it counted losses where the country scored 0 goals as missing scorers, which is not a real gap (nothing to attribute).

`scripts/import-worldcup-data.js` backfills authoritative match/scorer data from the [jfjelstul/worldcup](https://github.com/jfjelstul/worldcup) dataset for 1930–2018. Running it (after fixing 5 country-name mapping bugs — Bosnia & Herzegovina, China, Iceland, Trinidad & Tobago, UAE were being silently skipped) resolved every real gap in that range.

The only genuine gaps were 4 matches from Brazil's 2022 run (outside the dataset's 1930–2018 coverage), filled manually:
- 2022 Group Stage vs Serbia — Richarlison 62', 73'
- 2022 Group Stage vs Switzerland — Casemiro 83'
- 2022 Round of 16 vs South Korea — Vinícius Júnior 7', Neymar 13' (pen), Richarlison 29', Paquetá 36'
- 2022 Quarter-final vs Croatia — Neymar 105'

Remaining true gap count: **0**. (2026 data was added separately with full scorer detail; the dataset import doesn't touch 2022/2026.)
