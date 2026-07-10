#!/usr/bin/env node
/**
 * set-backfill.js — Scans all done countries in queue.json and marks ones
 * with missing scorers or <3 annotations as "backfill".
 *
 * Run after the main pipeline finishes:
 *   node scripts/set-backfill.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const QUEUE = path.join(ROOT, "queue.json");
const DATA_DIR = path.join(ROOT, "data/countries");

function hasGaps(data) {
  const kits = data.kits || {};
  for (const yearData of Object.values(kits)) {
    // Check annotation count
    const annotations = yearData.annotations || yearData.kits?.home?.annotations || [];
    if (annotations.length < 3) return true;

    // Check scorers on matches where this country scored
    const matches = yearData.matches || [];
    for (const m of matches) {
      const [ourScore] = (m.score || "0–0").split("–").map((s) => parseInt(s.trim(), 10));
      const scored = !isNaN(ourScore) && ourScore > 0;
      if (scored && (m.scorers === null || m.scorers === undefined)) return true;
    }
  }
  return false;
}

const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
let marked = 0;

for (const entry of queue) {
  if (entry.status !== "done") continue;
  const jsonPath = path.join(DATA_DIR, `${entry.id}.json`);
  if (!fs.existsSync(jsonPath)) continue;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch {
    continue;
  }

  if (hasGaps(data)) {
    entry.status = "backfill";
    marked++;
    console.log(`  backfill → ${entry.name}`);
  }
}

fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
console.log(`\nDone. ${marked} countries marked for backfill.`);
