import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { countries } from "../data/index.js";

const ALL_WORLD_CUPS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966,
  1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022, 2026,
];

const HOST = {
  1930: "Uruguay", 1934: "Italy", 1938: "France", 1950: "Brazil",
  1954: "Switzerland", 1958: "Sweden", 1962: "Chile", 1966: "England",
  1970: "Mexico", 1974: "West Germany", 1978: "Argentina", 1982: "Spain",
  1986: "Mexico", 1990: "Italy", 1994: "United States", 1998: "France",
  2002: "South Korea / Japan", 2006: "Germany", 2010: "South Africa",
  2014: "Brazil", 2018: "Russia", 2022: "Qatar", 2026: "USA, Canada & Mexico",
};

const RESULT_ORDER = [
  "Champions", "Runners-up", "3rd Place", "4th Place",
  "Semi-final", "Quarter-final", "Round of 16", "Round of 32", "2nd Round", "Group Stage",
];

function resultBadgeClass(result) {
  if (!result) return "result--group";
  if (result === "Champions") return "result--champion";
  if (result === "Runners-up") return "result--final";
  if (result.includes("3rd") || result.includes("4th") || result === "Semi-final") return "result--semi";
  if (result.includes("Quarter")) return "result--quarter";
  if (result.includes("Round of 16") || result.includes("Round of 32") || result.includes("2nd Round")) return "result--r16";
  return "result--group";
}

export default function TournamentYear() {
  const { year } = useParams();
  const navigate = useNavigate();
  const yr = parseInt(year, 10);

  const yearIndex = ALL_WORLD_CUPS.indexOf(yr);
  const prevYear = yearIndex > 0 ? ALL_WORLD_CUPS[yearIndex - 1] : null;
  const nextYear = yearIndex < ALL_WORLD_CUPS.length - 1 ? ALL_WORLD_CUPS[yearIndex + 1] : null;

  useEffect(() => {
    document.title = `${yr} World Cup · World Cup Archive`;
    return () => { document.title = "World Cup Archive"; };
  }, [yr]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft" && prevYear) navigate(`/year/${prevYear}`);
      if (e.key === "ArrowRight" && nextYear) navigate(`/year/${nextYear}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevYear, nextYear, navigate]);

  if (!ALL_WORLD_CUPS.includes(yr)) {
    return <div className="not-found">No World Cup in {year}.</div>;
  }

  const participants = countries
    .filter((c) => c.worldCups.includes(yr))
    .map((c) => ({
      ...c,
      result: c.kits?.[yr]?.result ?? null,
      hasKitData: !!(c.kits?.[yr]),
    }));

  const grouped = {};
  for (const c of participants) {
    const key = c.result || "Group Stage";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  const orderedGroups = RESULT_ORDER.filter((r) => grouped[r]);

  return (
    <div className="tournament-year">
      <nav className="kit-view-nav">
        <Link to="/" className="back-link">All Countries</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{yr} World Cup</span>
      </nav>

      <header className="tournament-header">
        <h1 className="tournament-title">{yr}</h1>
        <p className="tournament-subtitle">FIFA World Cup</p>
        <div className="tournament-meta-row">
          <span className="tournament-meta-item">Hosted by {HOST[yr]}</span>
          <span className="tournament-meta-sep">·</span>
          <span className="tournament-meta-item">{participants.length} nations</span>
        </div>
      </header>

      <div className="tournament-groups">
        {orderedGroups.map((result) => (
          <section key={result} className="tournament-group">
            <h2 className="tournament-group-label">{result}</h2>
            <div className="tournament-country-grid">
              {grouped[result].map((c) => (
                <Link
                  key={c.id}
                  to={c.hasKitData ? `/${c.id}/${yr}` : `/${c.id}`}
                  className="tournament-country-card"
                >
                  <img
                    src={`https://flagcdn.com/w160/${c.flagCode}.png`}
                    alt={c.name}
                    className="tournament-country-flag"
                  />
                  <div className="tournament-country-info">
                    <span className="tournament-country-name">{c.name}</span>
                    {c.result && (
                      <span className={`year-row-result ${resultBadgeClass(c.result)}`}>
                        {c.result}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="kit-year-nav">
        {prevYear ? (
          <Link to={`/year/${prevYear}`} className="kit-year-prev">
            <span className="kit-year-nav-arrow">←</span>
            <span className="kit-year-nav-info">
              <span className="kit-year-nav-year">{prevYear}</span>
              <span className="kit-year-nav-headline">{HOST[prevYear]}</span>
            </span>
          </Link>
        ) : <div />}
        {nextYear ? (
          <Link to={`/year/${nextYear}`} className="kit-year-next">
            <span className="kit-year-nav-info">
              <span className="kit-year-nav-year">{nextYear}</span>
              <span className="kit-year-nav-headline">{HOST[nextYear]}</span>
            </span>
            <span className="kit-year-nav-arrow">→</span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
