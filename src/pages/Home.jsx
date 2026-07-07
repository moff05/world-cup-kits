import { Link } from "react-router-dom";
import { countries } from "../data/index.js";

function Flag({ code, name }) {
  return (
    <img
      src={`https://flagcdn.com/80x60/${code}.png`}
      srcSet={`https://flagcdn.com/160x120/${code}.png 2x`}
      width="80" height="60"
      alt={`${name} flag`}
      className="country-flag"
    />
  );
}

export default function Home() {
  const grouped = countries.reduce((acc, c) => {
    if (!acc[c.confederation]) acc[c.confederation] = [];
    acc[c.confederation].push(c);
    return acc;
  }, {});

  return (
    <div className="home">
      <header className="site-header">
        <h1>World Cup Kits</h1>
        <p>The design, the history, the stories behind every jersey.</p>
      </header>

      {Object.entries(grouped).map(([conf, nations]) => (
        <section key={conf} className="conf-section">
          <h2 className="conf-label">{conf}</h2>
          <div className="country-grid">
            {nations.map((country) => (
              <Link key={country.id} to={`/${country.id}`} className="country-card">
                <Flag code={country.flagCode} name={country.name} />
                <span className="country-card-name">{country.name}</span>
                <span className="country-card-wcs">{country.worldCups.length} appearances</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
