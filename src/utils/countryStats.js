const RESULT_RANK = {
  "Champions": 9, "Runners-up": 8, "3rd Place": 7, "4th Place": 6,
  "Semi-final": 5, "Quarter-final": 4, "Round of 16": 3,
  "Round of 32": 2, "2nd Round": 2, "Group Stage": 1,
};

function extractScorerName(seg) {
  if (/\bOG\b/.test(seg)) return null;
  const tokens = seg.trim().split(/\s+/);
  let i = tokens.length - 1;
  // Strip trailing time tokens (start with digit) and annotations like (pen), (ET)
  while (i >= 0 && (/^\d/.test(tokens[i]) || /^\(/.test(tokens[i]))) i--;
  if (i < 0) return null;
  return tokens.slice(0, i + 1).join(" ");
}

function splitByEra(yearCounts, maxGap = 15) {
  const sorted = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  if (!sorted.length) return [];
  const clusters = [{ years: [sorted[0]], total: yearCounts[sorted[0]] }];
  for (let i = 1; i < sorted.length; i++) {
    const yr = sorted[i];
    if (yr - sorted[i - 1] > maxGap) {
      clusters.push({ years: [yr], total: yearCounts[yr] });
    } else {
      const c = clusters[clusters.length - 1];
      c.years.push(yr);
      c.total += yearCounts[yr];
    }
  }
  return clusters;
}

export function computeExtendedStats(country) {
  const allMatches = [];
  const resultsByYear = {};

  for (const [yr, kit] of Object.entries(country.kits || {})) {
    if (kit.result) resultsByYear[yr] = kit.result;
    for (const m of kit.matches || []) allMatches.push({ ...m, _yr: +yr });
  }

  if (allMatches.length === 0) return null;

  // Biggest win / loss
  let biggestWin = null, biggestWinMargin = 0;
  let biggestLoss = null, biggestLossMargin = 0;

  for (const m of allMatches) {
    const sm = m.score?.match(/^(\d+)–(\d+)/);
    if (!sm) continue;
    const gf = parseInt(sm[1], 10);
    const ga = parseInt(sm[2], 10);
    const margin = gf - ga;
    if (margin > biggestWinMargin) {
      biggestWinMargin = margin;
      biggestWin = { opponent: m.opponent, score: `${gf}–${ga}` };
    }
    if (margin < 0 && Math.abs(margin) > biggestLossMargin) {
      biggestLossMargin = Math.abs(margin);
      biggestLoss = { opponent: m.opponent, score: `${gf}–${ga}` };
    }
  }

  // Best / worst result
  let bestResult = null, bestRank = 0;
  let worstResult = null, worstRank = Infinity;
  for (const result of Object.values(resultsByYear)) {
    const rank = RESULT_RANK[result] || 0;
    if (rank > bestRank) { bestRank = rank; bestResult = result; }
    if (rank > 0 && rank < worstRank) { worstRank = rank; worstResult = result; }
  }

  // Top scorers — track per (name, year) then era-split same surnames spanning 15+ years
  const scorerGoals = {};
  for (const m of allMatches) {
    if (!m.scorers) continue;
    for (const seg of m.scorers.split(", ")) {
      const name = extractScorerName(seg);
      if (!name) continue;
      if (!scorerGoals[name]) scorerGoals[name] = {};
      scorerGoals[name][m._yr] = (scorerGoals[name][m._yr] || 0) + 1;
    }
  }
  const eraEntries = [];
  for (const [name, yearCounts] of Object.entries(scorerGoals)) {
    const clusters = splitByEra(yearCounts);
    for (const { years, total } of clusters) {
      const label = clusters.length > 1
        ? `${name} (${years[0]}–${years[years.length - 1]})`
        : name;
      eraEntries.push({ name: label, goals: total });
    }
  }
  const topScorers = eraEntries
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  // Most-faced opponent + H2H record
  const oppCount = {};
  const oppRecord = {};
  for (const m of allMatches) {
    oppCount[m.opponent] = (oppCount[m.opponent] || 0) + 1;
    if (!oppRecord[m.opponent]) oppRecord[m.opponent] = { w: 0, d: 0, l: 0 };
    if (m.result === "W") oppRecord[m.opponent].w++;
    else if (m.result === "D") oppRecord[m.opponent].d++;
    else if (m.result === "L") oppRecord[m.opponent].l++;
  }
  const rivalName = Object.entries(oppCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const rival = rivalName
    ? { name: rivalName, games: oppCount[rivalName], ...oppRecord[rivalName] }
    : null;

  return { biggestWin, biggestLoss, bestResult, worstResult, topScorers, rival };
}
