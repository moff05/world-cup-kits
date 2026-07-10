import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { countries } from "../data/index.js";

const CONF_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"];

function CountryCard({ country }) {
  return (
    <Link to={`/${country.id}`} className="country-card">
      <img
        src={`https://flagcdn.com/w320/${country.flagCode}.png`}
        alt=""
        className="country-card-flag-bg"
        draggable={false}
      />
      <div className="country-card-overlay" />
      <div className="country-card-slash" />
      <div className="country-card-info">
        <span className="country-card-name">{country.name}</span>
        <span className="country-card-wcs">{country.worldCups.length} {country.worldCups.length === 1 ? "appearance" : "appearances"}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [confFilter, setConfFilter] = useState("");
  const [sortBy, setSortBy] = useState("appearances-desc");

  useEffect(() => {
    document.title = "World Cup Archive";
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? countries.filter((c) => c.name.toLowerCase().includes(q))
    : countries;

  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.confederation]) acc[c.confederation] = [];
    acc[c.confederation].push(c);
    return acc;
  }, {});

  Object.values(grouped).forEach((list) => {
    list.sort((a, b) => {
      if (sortBy === "appearances-asc") return a.worldCups.length - b.worldCups.length;
      if (sortBy === "alpha-asc") return a.name.localeCompare(b.name);
      if (sortBy === "alpha-desc") return b.name.localeCompare(a.name);
      return b.worldCups.length - a.worldCups.length; // default: most first
    });
  });

  const orderedConfs = CONF_ORDER.filter((c) => grouped[c] && (!confFilter || c === confFilter));

  return (
    <div className="home">
      <header className="site-header">
        <h1>World Cup<br />Archive</h1>
        <p>Every nation's complete World Cup story — from 1930 to today.</p>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">{countries.length}</span>
            <span className="home-stat-label">Nations</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">23</span>
            <span className="home-stat-label">Tournaments</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">1930</span>
            <span className="home-stat-label">First Cup</span>
          </div>
        </div>
        <p className="pipeline-counter">{countries.length} / 83 nations researched by AI · auto-updating</p>
      </header>

      <div className="search-wrap">
        <input
          className="search-input"
          type="search"
          placeholder="Search nations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search nations"
        />
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value)}
            aria-label="Filter by confederation"
          >
            <option value="">All Confederations</option>
            {CONF_ORDER.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort teams"
          >
            <option value="appearances-desc">Most Appearances</option>
            <option value="appearances-asc">Fewest Appearances</option>
            <option value="alpha-asc">A – Z</option>
            <option value="alpha-desc">Z – A</option>
          </select>
        </div>
      </div>

      {q && filtered.length === 0 && (
        <p className="search-empty">No nations found for "{search}"</p>
      )}

      {orderedConfs.map((conf) => (
        <section key={conf} className="conf-section">
          <div className="conf-header">
            <h2 className="conf-label">{conf}</h2>
            <div className="conf-rule" />
            <span className="conf-count">{grouped[conf].length} nations</span>
          </div>
          <div className={`country-grid${grouped[conf].length < 4 ? " country-grid--flat" : ""}`}>
            {grouped[conf].map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
