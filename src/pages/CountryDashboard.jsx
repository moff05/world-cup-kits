import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { countries } from "../data/index.js";

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

  if (!country) return <div className="not-found">Country not found.</div>;

  const participated = new Set(country.worldCups);

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
      <Link to="/" className="back-link">All Countries</Link>

      <div className="dashboard-hero">
        <img
          src={`https://flagcdn.com/w80/${country.flagCode}.png`}
          srcSet={`https://flagcdn.com/w160/${country.flagCode}.png 2x`}
          width="80" height="53"
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

      <div className="year-accordion">
        {ALL_WORLD_CUPS.map((year) => {
          const was = participated.has(year);
          const yearData = country.kits?.[year];
          const result = yearData?.result;
          const matches = yearData?.matches;
          const hasStory = !!(yearData?.kits);
          const isOpen = openYears.has(year);
          const canExpand = matches?.length > 0;

          if (!was) {
            return (
              <div key={year} className="year-row year-row--absent">
                <span className="year-row-year">{year}</span>
                <span className="year-row-result">Did not qualify</span>
              </div>
            );
          }

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
              <button
                className="year-row-header"
                onClick={() => canExpand && toggleYear(year)}
                aria-expanded={isOpen}
                style={canExpand ? undefined : { cursor: "default" }}
              >
                <span className="year-row-year">{year}</span>
                <span className={`year-row-result ${resultBadgeClass(result)}`}>
                  {result || "—"}
                </span>
                {canExpand && (
                  <span className="year-row-toggle" aria-hidden="true">
                    {isOpen ? "▲" : "▼"}
                  </span>
                )}
              </button>

              {isOpen && canExpand && (
                <div className="year-row-body">
                  <table className="match-table">
                    <tbody>
                      {matches.map((m, i) => (
                        <tr key={i} className="match-row">
                          <td className="match-round">{m.round}</td>
                          <td className="match-opponent">vs. {m.opponent}</td>
                          <td className="match-score">{m.score}</td>
                          <td className={`match-wdl match-wdl--${m.result.toLowerCase()}`}>{m.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hasStory && (
                    <Link to={`/${country.id}/${year}`} className="year-row-story-link">
                      View story →
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
