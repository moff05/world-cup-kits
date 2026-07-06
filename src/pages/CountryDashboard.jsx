import { Link, useParams } from "react-router-dom";
import { countries } from "../data/countries.js";

const ALL_WORLD_CUPS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966,
  1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022, 2026,
];

export default function CountryDashboard() {
  const { countryId } = useParams();
  const country = countries.find((c) => c.id === countryId);

  if (!country) {
    return <div className="not-found">Country not found.</div>;
  }

  const participated = new Set(country.worldCups);
  const hasKit = (year) => country.kits?.[year];

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
          <p className="dashboard-meta">{country.confederation} · {country.worldCups.length} World Cup appearances</p>
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
      <p className="timeline-hint">Select a year to explore the kit and its story.</p>

      <div className="year-grid">
        {ALL_WORLD_CUPS.map((year) => {
          const was = participated.has(year);
          const kit = hasKit(year);

          if (!was) {
            return (
              <div key={year} className="year-tile year-tile--absent">
                <span className="year-tile-year">{year}</span>
                <span className="year-tile-label">Did not qualify</span>
              </div>
            );
          }

          if (kit) {
            return (
              <Link key={year} to={`/${country.id}/${year}`} className="year-tile year-tile--has-kit">
                <span className="year-tile-year">{year}</span>
                <span className="year-tile-label">{kit.headline}</span>
              </Link>
            );
          }

          return (
            <div key={year} className="year-tile year-tile--participated">
              <span className="year-tile-year">{year}</span>
              <span className="year-tile-label">Kit coming soon</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
