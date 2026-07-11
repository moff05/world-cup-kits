import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { countries } from "../data/index.js";

const CONF_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"];

const FEATURED = [
  { id: "argentina",  year: 1986, result: "Champions" },
  { id: "uruguay",    year: 1950, result: "Champions" },
  { id: "senegal",    year: 2002, result: "Quarter-final" },
  { id: "north-korea", year: 1966, result: "Quarter-final" },
  { id: "germany",    year: 2014, result: "Champions" },
  { id: "netherlands", year: 1974, result: "Runners-up" },
  { id: "morocco",    year: 2022, result: "4th Place" },
  { id: "cameroon",   year: 1990, result: "Quarter-final" },
  { id: "ukraine",    year: 2006, result: "Quarter-final" },
  { id: "south-korea", year: 2002, result: "4th Place" },
  { id: "algeria",    year: 1982, result: "Group Stage" },
  { id: "cuba",       year: 1938, result: "Quarter-final" },
  { id: "hungary",    year: 1954, result: "Runners-up" },
  { id: "turkey",     year: 2002, result: "3rd Place" },
  { id: "haiti",      year: 1974, result: "Group Stage" },
  { id: "croatia",    year: 2018, result: "Runners-up" },
  { id: "dr-congo",   year: 1974, result: "Group Stage" },
];

function FeaturedCard({ id, year, result }) {
  const country = countries.find((c) => c.id === id);
  if (!country) return null;
  const yearData = country.kits?.[year];
  const headline = yearData?.headline || "";
  return (
    <Link to={`/${id}`} className="featured-card" aria-label={`${country.name} ${year}`}>
      <img
        src={`https://flagcdn.com/w320/${country.flagCode}.png`}
        alt=""
        className="featured-card-bg"
      />
      <div className="featured-card-overlay" />
      <span className="featured-card-result">{result}</span>
      <div className="featured-card-body">
        <span className="featured-card-year">{year}</span>
        <span className="featured-card-country">{country.name}</span>
        {headline && <span className="featured-card-headline">{headline}</span>}
      </div>
    </Link>
  );
}

function FeaturedStrip() {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const dragRef = useRef(null);
  const movedRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const SPEED = 0.5;

    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += SPEED;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Wrap when user scrolls past the halfway loop point
    const onScroll = () => {
      const half = el.scrollWidth / 2;
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      if (el.scrollLeft <= 0 && pausedRef.current) el.scrollLeft = half - 2;
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Pause auto-scroll while mouse is inside
  const onMouseEnter = () => { pausedRef.current = true; };
  const onMouseLeave = () => {
    pausedRef.current = false;
    dragRef.current = null;
  };

  // Click-drag for desktop (pointer events)
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    movedRef.current = false;
    dragRef.current = { startX: e.clientX, startScroll: scrollRef.current.scrollLeft };
    scrollRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const el = scrollRef.current;
    const delta = dragRef.current.startX - e.clientX;
    if (Math.abs(delta) > 4) movedRef.current = true;
    const half = el.scrollWidth / 2;
    let next = dragRef.current.startScroll + delta;
    if (next < 0) next = 0;
    if (next >= half) next -= half;
    el.scrollLeft = next;
  };

  const onPointerUp = () => { dragRef.current = null; };

  const onClickCapture = (e) => {
    if (movedRef.current) { e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <div className="featured-strip">
      <div className="featured-strip-header">
        <span className="featured-strip-title">Featured Stories</span>
      </div>
      <div
        className="featured-strip-scroll"
        ref={scrollRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <div className="featured-track">
          {FEATURED.map(({ id, year, result }) => (
            <FeaturedCard key={`a-${id}-${year}`} id={id} year={year} result={result} />
          ))}
          {FEATURED.map(({ id, year, result }) => (
            <FeaturedCard key={`b-${id}-${year}`} id={id} year={year} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
        <p className="pipeline-counter">{countries.filter(c => Object.values(c.kits || {}).some(y => y.headline)).length} / {countries.length} nations documented</p>
      </header>

      <FeaturedStrip />

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
