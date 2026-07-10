import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { countries } from "../data/index.js";

const OPPONENT_FLAGS = {
  // CONMEBOL
  "Argentina": "ar", "Brazil": "br", "Uruguay": "uy", "Chile": "cl",
  "Paraguay": "py", "Colombia": "co", "Ecuador": "ec", "Peru": "pe", "Bolivia": "bo",
  // UEFA — current
  "Germany": "de", "Italy": "it", "France": "fr", "England": "gb-eng",
  "Spain": "es", "Netherlands": "nl", "Portugal": "pt", "Belgium": "be",
  "Sweden": "se", "Switzerland": "ch", "Poland": "pl", "Hungary": "hu",
  "Austria": "at", "Romania": "ro", "Bulgaria": "bg", "Croatia": "hr",
  "Serbia": "rs", "Denmark": "dk", "Norway": "no", "Turkey": "tr",
  "Greece": "gr", "Scotland": "gb-sct", "Wales": "gb-wls",
  "Republic of Ireland": "ie", "Northern Ireland": "gb-nir",
  "Czech Republic": "cz", "Slovakia": "sk", "Slovenia": "si",
  "Ukraine": "ua", "Bosnia & Herzegovina": "ba", "Bosnia": "ba",
  "Iceland": "is", "North Macedonia": "mk", "Albania": "al",
  "Russia": "ru", "Finland": "fi", "Georgia": "ge",
  // UEFA — historical
  "West Germany": "de", "East Germany": "de",
  "Soviet Union": "ru", "Yugoslavia": "rs",
  "Serbia and Montenegro": "rs", "FR Yugoslavia": "rs",
  "Czechoslovakia": "cz",
  // CONCACAF
  "Mexico": "mx", "United States": "us", "USA": "us",
  "Costa Rica": "cr", "Canada": "ca", "Honduras": "hn",
  "El Salvador": "sv", "Haiti": "ht", "Cuba": "cu",
  "Jamaica": "jm", "Trinidad and Tobago": "tt", "Trinidad & Tobago": "tt",
  "Panama": "pa",
  // CAF
  "Morocco": "ma", "Cameroon": "cm", "Nigeria": "ng", "Tunisia": "tn",
  "Senegal": "sn", "Ghana": "gh", "Ivory Coast": "ci", "Côte d'Ivoire": "ci",
  "Algeria": "dz", "Egypt": "eg", "South Africa": "za",
  "Angola": "ao", "Togo": "tg", "Zaire": "cd", "DR Congo": "cd",
  // AFC
  "Japan": "jp", "South Korea": "kr", "Iran": "ir", "Saudi Arabia": "sa",
  "Australia": "au", "North Korea": "kp", "China": "cn", "Qatar": "qa",
  "Iraq": "iq", "UAE": "ae", "Kuwait": "kw",
  "Indonesia": "id", "Dutch East Indies": "id",
  // OFC
  "New Zealand": "nz",
};

function opponentFlagCode(name) {
  if (OPPONENT_FLAGS[name]) return OPPONENT_FLAGS[name];
  const found = countries.find((c) => c.name === name);
  return found?.flagCode ?? null;
}


const ALL_WORLD_CUPS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966,
  1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022, 2026,
];

function resultBadgeClass(result) {
  if (!result) return "";
  if (result === "Champions") return "result--champion";
  if (result === "Runners-up") return "result--final";
  if (result.includes("3rd") || result.includes("4th") || result === "Semi-final") return "result--semi";
  if (result.includes("Quarter")) return "result--quarter";
  if (result.includes("Round of 16") || result.includes("2nd Round")) return "result--r16";
  return "result--group";
}

export default function CountryDashboard() {
  const { countryId } = useParams();
  const country = countries.find((c) => c.id === countryId);
  const [openYears, setOpenYears] = useState(new Set());

  useEffect(() => {
    if (country) document.title = `${country.name} · World Cup Archive`;
    return () => { document.title = "World Cup Archive"; };
  }, [country]);

  if (!country) return <div className="not-found">Country not found.</div>;

  const participated = new Set(country.worldCups);
  const hasKitData = Object.keys(country.kits || {}).length > 0;
  const stats = country.stats || null;

  const toggleYear = (year) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  return (
    <div className="dashboard">
      <nav className="kit-view-nav">
        <Link to="/" className="back-link">All Countries</Link>
      </nav>

      <div className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <img
            src={`https://flagcdn.com/w160/${country.flagCode}.png`}
            srcSet={`https://flagcdn.com/w320/${country.flagCode}.png 2x`}
            width="72" height="54"
            alt={`${country.name} flag`}
            className="dashboard-flag"
          />
          <div>
            <h1>{country.name}</h1>
            <p className="dashboard-meta">
              {country.confederation} · {country.worldCups.length} appearances
              {country.bestResult && <> · <strong>{country.bestResult}</strong></>}
            </p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="country-stats">
          <div className="country-stat">
            <span className="country-stat-num">{country.worldCups.length}</span>
            <span className="country-stat-label">Tournaments</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.matches}</span>
            <span className="country-stat-label">Matches</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.wins}W</span>
            <span className="country-stat-label">Wins</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.draws}D</span>
            <span className="country-stat-label">Draws</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.losses}L</span>
            <span className="country-stat-label">Losses</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.goalsFor}</span>
            <span className="country-stat-label">Goals For</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.goalsAgainst}</span>
            <span className="country-stat-label">Goals Against</span>
          </div>
          <div className="country-stat">
            <span className="country-stat-num">{stats.goalsFor - stats.goalsAgainst > 0 ? "+" : ""}{stats.goalsFor - stats.goalsAgainst}</span>
            <span className="country-stat-label">Goal Difference</span>
          </div>
        </div>
      )}

      {country.facts?.length > 0 && (
        <div className="country-facts">
          <h2 className="section-label">Kit Traditions</h2>
          <div className="facts-list">
            {country.facts.map((fact) => (
              <div key={fact.id} className="fact-item">
                <span className="fact-label">{fact.label}</span>
                <p className="fact-story">{fact.story}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-label">World Cup History</h2>

      {!hasKitData ? (
        <div className="empty-state">
          <p className="empty-state-heading">Kit data coming soon</p>
          <p className="empty-state-body">
            {country.name} appeared at {country.worldCups.length} World Cup{country.worldCups.length !== 1 ? "s" : ""}.
            Stories and kits are being researched and added.
          </p>
          <div className="empty-state-years">
            {country.worldCups.map((y) => (
              <span key={y} className="empty-state-year">{y}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="year-accordion">
          {ALL_WORLD_CUPS.map((year) => {
            const was = participated.has(year);
            const yearData = country.kits?.[year];
            const result = yearData?.result;
            const matches = yearData?.matches;
            const hasStory = !!(yearData?.kits);
            const isOpen = openYears.has(year);
            const canExpand = matches?.length > 0;

            if (!was) return null;

            if (!yearData) {
              return (
                <div key={year} className="year-row year-row--stub">
                  <span className="year-row-year">{year}</span>
                  <span className="year-row-result year-row-result--tbd">Participated</span>
                </div>
              );
            }

            return (
              <div key={year} className={`year-row year-row--data${isOpen ? " year-row--open" : ""}`}>
                <div className="year-row-header">
                  <span className="year-row-ghost" aria-hidden="true">{year}</span>
                  {hasStory ? (
                    <Link to={`/${country.id}/${year}`} className="year-row-link">
                      <span className="year-row-year">{year}</span>
                      <span className={`year-row-result ${resultBadgeClass(result)}`}>
                        {result || "—"}
                      </span>
                      <span className="year-row-explore">Explore →</span>
                    </Link>
                  ) : (
                    <div className="year-row-link year-row-link--no-story">
                      <span className="year-row-year">{year}</span>
                      <span className={`year-row-result ${resultBadgeClass(result)}`}>
                        {result || "—"}
                      </span>
                    </div>
                  )}
                  {canExpand && (
                    <button
                      className="year-row-toggle-btn"
                      onClick={() => toggleYear(year)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} ${year} matches`}
                    >
                      <span className="year-row-toggle-label">Matches</span>
                      <span className="year-row-toggle-arrow" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
                    </button>
                  )}
                </div>

                {isOpen && canExpand && (
                  <div className="year-row-body">
                    <table className="match-table">
                      <tbody>
                        {matches.map((m, i) => {
                          const flagCode = opponentFlagCode(m.opponent);
                          return (
                            <tr key={i} className="match-row">
                              <td className="match-round">{m.round}</td>
                              <td className="match-opponent">
                                <div className="match-opponent-inner">
                                  <span className="match-opponent-name">
                                    {flagCode && (
                                      <img
                                        src={`https://flagcdn.com/w40/${flagCode}.png`}
                                        alt=""
                                        className="match-flag"
                                      />
                                    )}
                                    {m.opponent}
                                  </span>
                                  {m.scorers && (
                                    <span className="match-scorers">{m.scorers}</span>
                                  )}
                                </div>
                              </td>
                              <td className="match-score">{m.score}</td>
                              <td className={`match-wdl match-wdl--${m.result.toLowerCase()}`}>{m.result}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
