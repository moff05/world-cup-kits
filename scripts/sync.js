#!/usr/bin/env node
/**
 * sync.js — One-shot conversion: data/countries/*.json → src/data/countries/*.js
 * and patches src/data/index.js. Exits cleanly (no file watching, no git ops).
 *
 * Run after writing/updating JSON files to prep for a git commit + push.
 * Usage: node scripts/sync.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data/countries");
const SRC_DIR = path.join(__dirname, "../src/data/countries");
const INDEX_FILE = path.join(__dirname, "../src/data/index.js");

function slugToExport(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function transformYearData(yearData) {
  if (!yearData || yearData.kits) return yearData;
  const { result, headline, story, annotations, homeColors, awayColors, image, imageCredit, matches } = yearData;
  const resolvedAnnotations = annotations?.length
    ? annotations
    : story
    ? [{ id: "story", label: (headline || "the story").toUpperCase(), story }]
    : [];
  return {
    result: result || null,
    headline: headline || null,
    homeColors: homeColors || null,
    awayColors: awayColors || null,
    matches: matches || [],
    kits: {
      home: {
        image: image || null,
        imageCredit: imageCredit || null,
        annotations: resolvedAnnotations,
      },
    },
  };
}

function jsonToJsModule(data) {
  const exportName = slugToExport(data.id);
  const normalized = { ...data };
  if (normalized.kits) {
    const numericKits = {};
    for (const [year, kitData] of Object.entries(normalized.kits)) {
      numericKits[Number(year)] = transformYearData(kitData);
    }
    normalized.kits = numericKits;
  }
  return `export const ${exportName} = ${JSON.stringify(normalized, null, 2)};\n`;
}

function patchIndex(id, exportName) {
  let src = fs.readFileSync(INDEX_FILE, "utf8");
  const importLine = `import { ${exportName} } from "./countries/${id}.js";`;
  if (!src.includes(importLine)) {
    const lastImport = src.lastIndexOf("\nimport ");
    const insertAt = src.indexOf("\n", lastImport + 1);
    src = src.slice(0, insertAt) + "\n" + importLine + src.slice(insertAt);
  }
  const arrayEntry = `  ${exportName},`;
  if (!src.includes(arrayEntry)) {
    const arrayClose = src.lastIndexOf("];");
    src = src.slice(0, arrayClose) + arrayEntry + "\n" + src.slice(arrayClose);
  }
  fs.writeFileSync(INDEX_FILE, src);
}

if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive: true });

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "schema.json");
let processed = 0;

for (const filename of files) {
  const id = path.basename(filename, ".json");
  const exportName = slugToExport(id);
  try {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf8"));
    const jsContent = jsonToJsModule(data);
    fs.writeFileSync(path.join(SRC_DIR, `${id}.js`), jsContent);
    patchIndex(id, exportName);
    processed++;
  } catch (e) {
    console.error(`  ✗ ${filename}: ${e.message}`);
  }
}

console.log(`sync: ${processed}/${files.length} files converted.`);
