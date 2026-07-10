#!/usr/bin/env node
/**
 * import-worldcup-data.js
 *
 * Downloads jfjelstul/worldcup dataset (team_appearances.csv + goals.csv)
 * and merges authoritative match data into every country JSON in data/countries/.
 *
 * What it replaces: AI-researched match records and scorers (1930–2018).
 * What it keeps:    headline, annotations, homeColors, awayColors, facts.
 *
 * Run: node scripts/import-worldcup-data.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data/countries");

const BASE = "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv";
const TEAM_APPEARANCES_URL = `${BASE}/team_appearances.csv`;
const GOALS_URL = `${BASE}/goals.csv`;

// Men's World Cup years only
const MENS_YEARS = new Set([
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970,
  1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006,
  2010, 2014, 2018,
]);

// Map jfjelstul team names → our country file IDs
const TEAM_NAME_TO_ID = {
  "Algeria": "algeria",
  "Angola": "angola",
  "Argentina": "argentina",
  "Australia": "australia",
  "Austria": "austria",
  "Belgium": "belgium",
  "Bolivia": "bolivia",
  "Bosnia and Herzegovina": "bosnia-herzegovina",
  "Brazil": "brazil",
  "Bulgaria": "bulgaria",
  "Cameroon": "cameroon",
  "Canada": "canada",
  "Chile": "chile",
  "China PR": "china",
  "Colombia": "colombia",
  "Costa Rica": "costa-rica",
  "Croatia": "croatia",
  "Cuba": "cuba",
  "Czech Republic": "czech-republic",
  "Czechoslovakia": "czech-republic",
  "Denmark": "denmark",
  "DR Congo": "dr-congo",
  "Dutch East Indies": "indonesia",
  "Ecuador": "ecuador",
  "Egypt": "egypt",
  "El Salvador": "el-salvador",
  "England": "england",
  "France": "france",
  "German DR": "east-germany",
  "Germany": "germany",
  "West Germany": "germany",
  "Ghana": "ghana",
  "Greece": "greece",
  "Haiti": "haiti",
  "Honduras": "honduras",
  "Hungary": "hungary",
  "Indonesia": "indonesia",
  "Iran": "iran",
  "Iraq": "iraq",
  "Israel": "israel",
  "Italy": "italy",
  "Ivory Coast": "ivory-coast",
  "Jamaica": "jamaica",
  "Japan": "japan",
  "Kuwait": "kuwait",
  "Mexico": "mexico",
  "Morocco": "morocco",
  "Netherlands": "netherlands",
  "New Zealand": "new-zealand",
  "Nigeria": "nigeria",
  "North Korea": "north-korea",
  "Northern Ireland": "northern-ireland",
  "Norway": "norway",
  "Panama": "panama",
  "Paraguay": "paraguay",
  "Peru": "peru",
  "Poland": "poland",
  "Portugal": "portugal",
  "Qatar": "qatar",
  "Republic of Ireland": "republic-of-ireland",
  "Romania": "romania",
  "Russia": "russia",
  "Saudi Arabia": "saudi-arabia",
  "Scotland": "scotland",
  "Senegal": "senegal",
  "Serbia": "serbia",
  "Serbia and Montenegro": "serbia",
  "Slovakia": "slovakia",
  "Slovenia": "slovenia",
  "South Africa": "south-africa",
  "South Korea": "south-korea",
  "Soviet Union": "russia",
  "Spain": "spain",
  "Sweden": "sweden",
  "Switzerland": "switzerland",
  "Togo": "togo",
  "Trinidad and Tobago": "trinidad-tobago",
  "Tunisia": "tunisia",
  "Turkey": "turkey",
  "Ukraine": "ukraine",
  "United Arab Emirates": "united-arab-emirates",
  "United Arab Republic": "egypt",
  "United States": "usa",
  "Uruguay": "uruguay",
  "Wales": "wales",
  "Yugoslavia": "serbia",
  "Zaire": "dr-congo",
};

const STAGE_MAP = {
  "group stage": "Group Stage",
  "round of 32": "Round of 32",
  "round of 16": "Round of 16",
  "second group stage": "2nd Round",
  "quarter-final": "Quarter-final",
  "quarter-finals": "Quarter-final",
  "semi-final": "Semi-final",
  "semi-finals": "Semi-final",
  "third-place play-off": "3rd Place",
  "final": "Final",
};

// Determine tournament result string from a team's matches in that year
function computeResult(matches) {
  const STAGE_ORDER = [
    "group stage", "round of 32", "second group stage",
    "round of 16", "quarter-final", "semi-final",
    "third-place play-off", "final",
  ];
  let last = null;
  for (const stage of STAGE_ORDER) {
    const inStage = matches.filter((m) => m._stage === stage);
    if (inStage.length > 0) last = inStage[inStage.length - 1];
  }
  if (!last) return null;
  if (last._stage === "final") return last._win ? "Champions" : "Runners-up";
  if (last._stage === "third-place play-off") return last._win ? "3rd Place" : "4th Place";
  return STAGE_MAP[last._stage] || last._stage;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current); current = ""; }
      else { current += ch; }
    }
    values.push(current);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

console.log("Fetching dataset from jfjelstul/worldcup...");
const [taText, goalsText] = await Promise.all([
  fetchText(TEAM_APPEARANCES_URL),
  fetchText(GOALS_URL),
]);

console.log("Parsing CSVs...");
const teamAppearances = parseCSV(taText).filter((r) => {
  const year = parseInt(r.tournament_id.replace("WC-", ""), 10);
  return MENS_YEARS.has(year);
});
const goals = parseCSV(goalsText).filter((r) => {
  const year = parseInt(r.tournament_id.replace("WC-", ""), 10);
  return MENS_YEARS.has(year);
});

// Build goals lookup: matchId + teamId → sorted goals array
const goalsLookup = {};
for (const g of goals) {
  const key = `${g.match_id}::${g.team_id}`;
  if (!goalsLookup[key]) goalsLookup[key] = [];
  goalsLookup[key].push(g);
}
// Sort each entry by minute
for (const arr of Object.values(goalsLookup)) {
  arr.sort((a, b) => parseInt(a.minute_regulation, 10) - parseInt(b.minute_regulation, 10));
}

function buildScorers(matchId, teamId) {
  const key = `${matchId}::${teamId}`;
  const gs = goalsLookup[key];
  if (!gs || gs.length === 0) return null;
  return gs
    .map((g) => {
      const name = g.family_name || g.given_name || "Unknown";
      const min = g.minute_label || `${g.minute_regulation}'`;
      if (g.own_goal === "1") return `${name} OG ${min}`;
      return `${name} ${min}`;
    })
    .join(", ");
}

// Group appearances: countryId → year → [match rows]
const byCountryYear = {};
for (const row of teamAppearances) {
  const countryId = TEAM_NAME_TO_ID[row.team_name];
  if (!countryId) continue;
  const year = parseInt(row.tournament_id.replace("WC-", ""), 10);
  const key = `${countryId}::${year}`;
  if (!byCountryYear[key]) byCountryYear[key] = [];
  byCountryYear[key].push(row);
}

// Build match array for a country-year
function buildMatches(rows) {
  // Sort by date
  rows.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  return rows.map((r) => {
    const isPenalty = r.penalty_shootout === "1";
    const gf = r.goals_for;
    const ga = r.goals_against;
    let score = `${gf}–${ga}`;
    if (isPenalty) score += ` (${r.penalties_for}–${r.penalties_against} pens)`;
    const result = isPenalty ? "D" : r.win === "1" ? "W" : r.draw === "1" ? "D" : "L";
    const scorers = buildScorers(r.match_id, r.team_id);
    return {
      round: STAGE_MAP[r.stage_name] || r.stage_name,
      opponent: r.opponent_name,
      score,
      result,
      scorers,
      _stage: r.stage_name,
      _win: r.win === "1",
    };
  });
}

// Merge dataset data into existing country JSONs
let updated = 0;
let skipped = 0;

const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "schema.json");

for (const file of files) {
  const countryId = file.replace(".json", "");
  const jsonPath = path.join(DATA_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch {
    continue;
  }

  let changed = false;
  const existingKits = data.kits || {};

  // Find all years for this country in the dataset
  const datasetYears = new Set(
    Object.keys(byCountryYear)
      .filter((k) => k.startsWith(`${countryId}::`))
      .map((k) => parseInt(k.split("::")[1], 10))
  );

  if (datasetYears.size === 0) {
    skipped++;
    continue;
  }

  for (const year of datasetYears) {
    const key = `${countryId}::${year}`;
    const rows = byCountryYear[key];
    const matches = buildMatches(rows);
    const cleanMatches = matches.map(({ _stage, _win, ...m }) => m);

    const existingYear = existingKits[year] || existingKits[String(year)];
    if (existingYear) {
      // Merge: replace match data, keep editorial content
      existingYear.matches = cleanMatches;
      existingYear.result = computeResult(matches);
      // Ensure year key is numeric
      delete existingKits[String(year)];
      existingKits[year] = existingYear;
    } else {
      // New year: add skeleton with match data only
      existingKits[year] = {
        result: computeResult(matches),
        headline: null,
        homeColors: null,
        awayColors: null,
        matches: cleanMatches,
        annotations: [],
      };
    }
    changed = true;
  }

  if (changed) {
    data.kits = existingKits;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✓ ${data.name} — ${datasetYears.size} years updated`);
    updated++;
  }
}

console.log(`\nDone. ${updated} countries updated, ${skipped} skipped (not in dataset).`);
console.log("Run 'node watch.js' or let the watcher pick up the changes.");
