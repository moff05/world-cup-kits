const RESULT_RANK = {
  "Champions": 9, "Runners-up": 8, "3rd Place": 7, "4th Place": 6,
  "Semi-final": 5, "Quarter-final": 4, "Round of 16": 3,
  "Round of 32": 2, "2nd Round": 2, "Group Stage": 1,
};


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
      biggestWin = { opponent: m.opponent, score: `${gf}–${ga}`, year: m._yr, round: m.round };
    }
    if (margin < 0 && Math.abs(margin) > biggestLossMargin) {
      biggestLossMargin = Math.abs(margin);
      biggestLoss = { opponent: m.opponent, score: `${gf}–${ga}`, year: m._yr, round: m.round };
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

  return { biggestWin, biggestLoss, bestResult, worstResult, rival };
}
