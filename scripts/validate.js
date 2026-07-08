#!/usr/bin/env node
/**
 * validate.js — Checks data/countries/*.json for integrity issues before build.
 * Run: node scripts/validate.js
 * Also runs automatically as `npm run prebuild`.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data/countries");

const VALID_CONFEDERATIONS = new Set(["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"]);
const VALID_RESULTS = new Set([
  "Champions", "Runners-up", "3rd Place", "4th Place",
  "Semi-final", "Quarter-final", "Round of 16", "2nd Round", "Group Stage",
]);
const VALID_WDL = new Set(["W", "D", "L"]);
const ALL_WORLD_CUPS = new Set([
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966,
  1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022,
]);

let errors = 0;
let warnings = 0;

function err(file, msg) {
  console.error(`  ✗ [${file}] ${msg}`);
  errors++;
}

function warn(file, msg) {
  console.warn(`  ⚠ [${file}] ${msg}`);
  warnings++;
}

const files = fs.existsSync(DATA_DIR)
  ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "schema.json")
  : [];

if (files.length === 0) {
  console.log("validate: no country JSON files found, skipping.");
  process.exit(0);
}

console.log(`Validating ${files.length} country file(s)…`);

for (const filename of files) {
  const filepath = path.join(DATA_DIR, filename);
  let data;

  try {
    data = JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    err(filename, `JSON parse error: ${e.message}`);
    continue;
  }

  const f = filename;

  // Required top-level fields
  if (!data.id) err(f, "missing `id`");
  if (!data.name) err(f, "missing `name`");
  if (!data.flagCode) err(f, "missing `flagCode`");
  if (!data.confederation) err(f, "missing `confederation`");
  else if (!VALID_CONFEDERATIONS.has(data.confederation))
    err(f, `invalid confederation "${data.confederation}"`);

  if (!Array.isArray(data.worldCups) || data.worldCups.length === 0)
    err(f, "missing or empty `worldCups`");
  else {
    for (const y of data.worldCups) {
      if (!ALL_WORLD_CUPS.has(y)) err(f, `invalid worldCups year ${y} (2026 not allowed)`);
    }
  }

  // id should match filename
  const expectedId = path.basename(filename, ".json");
  if (data.id && data.id !== expectedId)
    err(f, `id "${data.id}" doesn't match filename "${expectedId}"`);

  // Stats integrity
  if (data.stats) {
    const { matches, wins, draws, losses } = data.stats;
    if (matches !== wins + draws + losses)
      err(f, `stats mismatch: matches=${matches} but W+D+L=${wins + draws + losses}`);
  }

  // Kit-level checks
  if (data.kits) {
    for (const [year, kit] of Object.entries(data.kits)) {
      const yr = `year ${year}`;

      if (kit.result && !VALID_RESULTS.has(kit.result))
        err(f, `${yr}: invalid result "${kit.result}"`);

      if (kit.matches) {
        for (const m of kit.matches) {
          if (!VALID_WDL.has(m.result))
            err(f, `${yr}: match vs ${m.opponent} has invalid result "${m.result}"`);
          if (m.score && m.score.includes("-") && !m.score.includes("–"))
            warn(f, `${yr}: match vs ${m.opponent} score uses hyphen instead of en-dash`);
        }
      }

      // Nested kits shape
      if (kit.kits?.home?.image) {
        const img = kit.kits.home.image;
        if (!img.startsWith("http"))
          err(f, `${yr}: image URL doesn't look like a URL: "${img}"`);
      }
    }
  }
}

console.log("");
if (errors > 0) {
  console.error(`Validation failed: ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`Validation passed with ${warnings} warning(s).`);
} else {
  console.log(`✓ All ${files.length} files valid.`);
}
