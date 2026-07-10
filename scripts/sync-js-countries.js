#!/usr/bin/env node
/**
 * sync-js-countries.js
 *
 * Companion to import-worldcup-data.js for countries that only have a
 * src/data/countries/*.js file (no data/countries/*.json source file).
 * Loads each JS file via dynamic import, updates match data + scorers from
 * the jfjelstul dataset, and writes the result back to the JS file.
 *
 * Run: node scripts/sync-js-countries.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src/data/countries");
const DATA_DIR = path.join(ROOT, "data/countries");

const BASE = "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv";

const MENS_YEARS = new Set([
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970,
  1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006,
  2010, 2014, 2018,
]);

const TEAM_NAME_TO_ID = {
  "Angola": "angola",
  "Bosnia and Herzegovina": "bosnia-and-herzegovina",
  "Brazil": "brazil",
  "China": "china",
  "Cuba": "cuba",
  "Dutch East Indies": "indonesia",
  "Haiti": "haiti",
  "Iceland": "iceland",
  "Iraq": "iraq",
  "Israel": "israel",
  "Jamaica": "jamaica",
  "Kuwait": "kuwait",
  "Panama": "panama",
  "Qatar": "qatar",
  "Togo": "togo",
  "Trinidad and Tobago": "trinidad-and-tobago",
  "United Arab Emirates": "uae",
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

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
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
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { values.push(cur); cur = ""; }
      else cur += ch;
    }
    values.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function computeResult(matches) {
  const ORDER = [
    "group stage", "round of 32", "second group stage",
    "round of 16", "quarter-final", "quarter-finals",
    "semi-final", "semi-finals", "third-place play-off", "final",
  ];
  let last = null;
  for (const stage of ORDER) {
    const m = matches.filter((x) => x._stage === stage);
    if (m.length) last = m[m.length - 1];
  }
  if (!last) return null;
  const s = last._stage;
  if (s === "final") return last._win ? "Champions" : "Runners-up";
  if (s === "third-place play-off") return last._win ? "3rd Place" : "4th Place";
  return STAGE_MAP[s] || s;
}

// Find JS-only countries (no corresponding JSON in data/countries/)
const jsFiles = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".js"));
const jsOnlyIds = jsFiles
  .map((f) => f.replace(".js", ""))
  .filter((id) => !fs.existsSync(path.join(DATA_DIR, `${id}.json`)));

if (jsOnlyIds.length === 0) {
  console.log("No JS-only countries found. All countries have JSON source files.");
  process.exit(0);
}

console.log(`Found ${jsOnlyIds.length} JS-only countries: ${jsOnlyIds.join(", ")}`);
console.log("Fetching dataset...");

const [taText, goalsText] = await Promise.all([
  fetchText(`${BASE}/team_appearances.csv`),
  fetchText(`${BASE}/goals.csv`),
]);

const teamAppearances = parseCSV(taText).filter((r) => {
  const year = parseInt(r.tournament_id.replace("WC-", ""), 10);
  return MENS_YEARS.has(year);
});
const goals = parseCSV(goalsText).filter((r) => {
  const year = parseInt(r.tournament_id.replace("WC-", ""), 10);
  return MENS_YEARS.has(year);
});

// Build goals lookup
const goalsLookup = {};
for (const g of goals) {
  const key = `${g.match_id}::${g.team_id}`;
  if (!goalsLookup[key]) goalsLookup[key] = [];
  goalsLookup[key].push(g);
}
for (const arr of Object.values(goalsLookup)) {
  arr.sort((a, b) => parseInt(a.minute_regulation, 10) - parseInt(b.minute_regulation, 10));
}

function buildScorers(matchId, teamId) {
  const gs = goalsLookup[`${matchId}::${teamId}`];
  if (!gs?.length) return null;
  return gs.map((g) => {
    const name = g.family_name || g.given_name || "Unknown";
    const min = g.minute_label || `${g.minute_regulation}'`;
    return g.own_goal === "1" ? `${name} OG ${min}` : `${name} ${min}`;
  }).join(", ");
}

// Build matches per country+year from dataset
const byCountryYear = {};
for (const row of teamAppearances) {
  const id = TEAM_NAME_TO_ID[row.team_name];
  if (!id || !jsOnlyIds.includes(id)) continue;
  const year = parseInt(row.tournament_id.replace("WC-", ""), 10);
  const key = `${id}::${year}`;
  if (!byCountryYear[key]) byCountryYear[key] = [];
  byCountryYear[key].push(row);
}

function buildMatches(rows) {
  rows.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  return rows.map((r) => {
    const isPen = r.penalty_shootout === "1";
    let score = `${r.goals_for}–${r.goals_against}`;
    if (isPen) score += ` (${r.penalties_for}–${r.penalties_against} pens)`;
    const result = isPen ? "D" : r.win === "1" ? "W" : r.draw === "1" ? "D" : "L";
    const scorers = buildScorers(r.match_id, r.team_id);
    return { round: STAGE_MAP[r.stage_name] || r.stage_name, opponent: r.opponent_name, score, result, scorers, _stage: r.stage_name, _win: r.win === "1" };
  });
}

// Process each JS-only country
for (const id of jsOnlyIds) {
  const jsPath = path.join(SRC_DIR, `${id}.js`);
  const mod = await import(pathToFileURL(jsPath).href);
  const exportKey = Object.keys(mod)[0];
  const data = JSON.parse(JSON.stringify(mod[exportKey])); // deep clone

  const datasetYears = Object.keys(byCountryYear)
    .filter((k) => k.startsWith(`${id}::`))
    .map((k) => parseInt(k.split("::")[1], 10));

  if (datasetYears.length === 0) {
    console.log(`⚠  No dataset entries for ${id}, skipping`);
    continue;
  }

  let changed = 0;
  const kits = data.kits || {};

  for (const year of datasetYears) {
    const rows = byCountryYear[`${id}::${year}`];
    const matches = buildMatches(rows);
    const cleanMatches = matches.map(({ _stage, _win, ...m }) => m);

    // Find the year entry — could be string or number key
    const yearKey = kits[year] !== undefined ? year : String(year);
    if (kits[yearKey]) {
      kits[yearKey].matches = cleanMatches;
      if (!kits[yearKey].result) kits[yearKey].result = computeResult(matches);
      changed++;
    } else if (Object.keys(kits).length === 0) {
      // Stub country with no kits at all — seed year from dataset
      kits[year] = {
        result: computeResult(matches),
        headline: null,
        homeColors: null,
        awayColors: null,
        matches: cleanMatches,
        annotations: [],
      };
      changed++;
    }
  }

  data.kits = kits;

  // Write back as JS module preserving the export name
  const output = `export const ${exportKey} = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(jsPath, output);
  console.log(`✓ ${data.name} — ${changed} years updated with dataset matches + scorers`);
}

console.log("\nDone.");
