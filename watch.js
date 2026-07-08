#!/usr/bin/env node
/**
 * watch.js — Watches data/countries/*.json for new/updated files from cowork.
 * Converts each JSON file to a JS module in src/data/countries/ and patches
 * src/data/index.js if the country is new.
 *
 * Run: node watch.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data/countries");
const SRC_DIR = path.join(__dirname, "src/data/countries");
const INDEX_FILE = path.join(__dirname, "src/data/index.js");

function slugToExport(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Cowork writes a flat year shape: { result, headline, story, homeColors, awayColors, image, imageCredit, matches }
// The site expects: { result, headline, matches, kits: { home: { image, imageCredit, annotations } } }
// This transform bridges the two. Years that already have a nested `kits` object are left untouched (e.g. Brazil).
function transformYearData(yearData) {
  if (!yearData || yearData.kits) return yearData;
  const { result, headline, story, annotations, homeColors, awayColors, image, imageCredit, matches } = yearData;
  // Future Cowork runs write `annotations[]` directly; older runs wrote a single `story` string.
  // Normalise both into the site's kit.home.annotations format.
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

function processFile(jsonPath) {
  const filename = path.basename(jsonPath);
  if (!filename.endsWith(".json") || filename === "schema.json") return;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (err) {
    console.error(`✗ Failed to parse ${filename}: ${err.message}`);
    return;
  }

  if (!data.id || !data.name) {
    console.error(`✗ ${filename} missing required id or name field`);
    return;
  }

  // Write JS module
  const jsPath = path.join(SRC_DIR, `${data.id}.js`);
  const isNew = !fs.existsSync(jsPath);
  fs.writeFileSync(jsPath, jsonToJsModule(data));
  console.log(`${isNew ? "✦" : "✓"} ${data.name} → src/data/countries/${data.id}.js`);

  // Patch index.js if this is a new country
  if (isNew) {
    patchIndex(data.id, slugToExport(data.id));
  }
}

function patchIndex(id, exportName) {
  let src = fs.readFileSync(INDEX_FILE, "utf8");

  // Add import if not already present
  const importLine = `import { ${exportName} } from "./countries/${id}.js";`;
  if (!src.includes(importLine)) {
    // Insert after the last import line
    const lastImport = src.lastIndexOf("\nimport ");
    const insertAt = src.indexOf("\n", lastImport + 1);
    src = src.slice(0, insertAt) + "\n" + importLine + src.slice(insertAt);
  }

  // Add to countries array if not present
  const arrayEntry = `  ${exportName},`;
  if (!src.includes(arrayEntry)) {
    const arrayClose = src.lastIndexOf("];");
    src = src.slice(0, arrayClose) + arrayEntry + "\n" + src.slice(arrayClose);
  }

  fs.writeFileSync(INDEX_FILE, src);
  console.log(`  ↳ Patched index.js with ${exportName}`);
}

// Process all existing JSON files on startup
console.log("World Cup Kits — data watcher started");
console.log(`Watching: ${DATA_DIR}`);
console.log("─".repeat(50));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const existing = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "schema.json");
if (existing.length > 0) {
  console.log(`Processing ${existing.length} existing file(s)...`);
  for (const f of existing) {
    processFile(path.join(DATA_DIR, f));
  }
}

// Watch for new/changed files
fs.watch(DATA_DIR, { persistent: true }, (event, filename) => {
  if (!filename || !filename.endsWith(".json") || filename === "schema.json") return;
  const fullPath = path.join(DATA_DIR, filename);
  // Small delay to ensure the write is complete before reading
  setTimeout(() => {
    if (fs.existsSync(fullPath)) {
      processFile(fullPath);
    }
  }, 100);
});

console.log("Waiting for cowork to drop files...\n");
