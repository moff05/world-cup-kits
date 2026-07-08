import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { countries } from "../data/index.js";

const FLAG_OVERRIDES = {
  "England": "gb-eng", "Scotland": "gb-sct", "Wales": "gb-wls", "Northern Ireland": "gb-nir",
  "West Germany": "de", "East Germany": "de", "Soviet Union": "ru", "Yugoslavia": "rs",
  "Czechoslovakia": "cz", "Zaire": "cd", "Serbia and Montenegro": "rs",
  "Netherlands Antilles": "nl", "Dutch East Indies": "id", "Saar": "de",
  "United Arab Republic": "eg", "Bohemia": "cz", "North Vietnam": "vn",
};
const NAME_TO_FLAG = Object.fromEntries(countries.map((c) => [c.name, c.flagCode]));
function opponentFlagCode(opponent) {
  return FLAG_OVERRIDES[opponent] || NAME_TO_FLAG[opponent] || null;
}

function StoryText({ text, countryId, kitYears }) {
  const parts = [];
  const yearRegex = /\b(1[89]\d{2}|20\d{2})\b/g;
  let lastIndex = 0;
  let match;
  while ((match = yearRegex.exec(text)) !== null) {
    const year = Number(match[1]);
    if (kitYears.has(year)) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(
        <Link key={match.index} to={`/${countryId}/${year}`} className="story-year-link">
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }
  }
  parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <img
        src={src}
        alt={alt}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function KitPanel({ kit, kitType, countryId, kitYears, yearData }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="kit-panel">
      <div
        className={`kit-image-wrap${kit.image ? " kit-image-wrap--clickable" : ""}`}
        style={kit.imageBg ? { background: kit.imageBg } : undefined}
        onClick={() => kit.image && setLightboxOpen(true)}
        title={kit.image ? "Click to enlarge" : undefined}
      >
        {kit.image ? (
          <img src={kit.image} alt={`${kitType} kit`} className="kit-photo" draggable={false} />
        ) : (
          <div className="kit-image-placeholder">
            <p>No photograph available</p>
          </div>
        )}
        {kit.image && <span className="kit-image-zoom-hint">⤢ Enlarge</span>}
      </div>

      {lightboxOpen && (
        <Lightbox
          src={kit.image}
          alt={`${kitType} kit`}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {kit.imageCredit && (
        <p className="image-credit">
          {kit.imageCredit.player && <strong>{kit.imageCredit.player}</strong>}
          {kit.imageCredit.player && kit.imageCredit.game && " · "}
          {kit.imageCredit.game}
        </p>
      )}

      {kit.annotations?.length > 0 && (
        <div className="annotation-list">
          {kit.annotations.map((ann) => (
            <div key={ann.id} className="annotation-list-item">
              <h3 className="annotation-list-label">{ann.label}</h3>
              <p className="annotation-list-story">
                <StoryText text={ann.story} countryId={countryId} kitYears={kitYears} />
              </p>
            </div>
          ))}
        </div>
      )}

      {!kit.annotations?.length && yearData?.story && (
        <p className="kit-year-story">
          <StoryText text={yearData.story} countryId={countryId} kitYears={kitYears} />
        </p>
      )}
    </div>
  );
}

export default function KitView() {
  const { countryId, year } = useParams();
  const navigate = useNavigate();
  const country = countries.find((c) => c.id === countryId);
  const yearData = country?.kits?.[Number(year)];
  const kitYears = new Set(Object.keys(country?.kits || {}).map(Number));
  const sortedKitYears = [...kitYears].sort((a, b) => a - b);

  const kitTypes = yearData ? Object.keys(yearData.kits) : [];
  const [activeKit, setActiveKit] = useState(kitTypes[0] || "home");

  const yearIndex = sortedKitYears.indexOf(Number(year));
  const prevYear = yearIndex > 0 ? sortedKitYears[yearIndex - 1] : null;
  const nextYear = yearIndex < sortedKitYears.length - 1 ? sortedKitYears[yearIndex + 1] : null;

  useEffect(() => {
    if (country && year) document.title = `${country.name} ${year} · World Cup Kits`;
    return () => { document.title = "World Cup Kits"; };
  }, [country, year]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft" && prevYear) navigate(`/${countryId}/${prevYear}`);
      if (e.key === "ArrowRight" && nextYear) navigate(`/${countryId}/${nextYear}`);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevYear, nextYear, countryId, navigate]);

  if (!country || !yearData) {
    return <div className="not-found">Kit not found.</div>;
  }

  const currentKit = yearData.kits[activeKit];

  return (
    <div className="kit-view">
      <div className="kit-view-nav">
        <Link to={`/${countryId}`} className="back-link">{country.name}</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{year}</span>
      </div>

      <div className="kit-view-hero">
        <div className="kit-view-header">
          <img
            src={`https://flagcdn.com/w160/${country.flagCode}.png`}
            srcSet={`https://flagcdn.com/w320/${country.flagCode}.png 2x`}
            width="72" height="54"
            alt={`${country.name} flag`}
            className="dashboard-flag"
          />
          <div>
            <h1>{country.name}</h1>
            <p className="kit-view-meta">
              <span className="kit-view-year">{year}</span>
              {yearData.headline && <> · {yearData.headline}</>}
            </p>
          </div>
        </div>
      </div>

      {kitTypes.length > 1 && (
        <div className="kit-tabs">
          {kitTypes.map((type) => (
            <button
              key={type}
              className={`kit-tab ${activeKit === type ? "kit-tab--active" : ""}`}
              onClick={() => setActiveKit(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="kit-content-grid">
        {currentKit && (
          <KitPanel
            kit={currentKit}
            kitType={activeKit}
            countryId={countryId}
            kitYears={kitYears}
            yearData={yearData}
          />
        )}

        <aside className="kit-sidebar">
          <p className="kit-sidebar-label">{country.name}</p>
          <nav className="kit-year-list">
            {sortedKitYears.map((y) => (
              <Link
                key={y}
                to={`/${countryId}/${y}`}
                className={`kit-year-item${y === Number(year) ? " kit-year-item--active" : ""}`}
              >
                <span className="kit-year-item-year">{y}</span>
                <span className="kit-year-item-headline">{country.kits[y].headline}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {yearData.matches?.length > 0 && (
        <section className="kit-matches">
          <h3 className="kit-matches-title">Matches</h3>
          <table className="match-table">
            <tbody>
              {yearData.matches.map((m, i) => {
                const flagCode = opponentFlagCode(m.opponent);
                return (
                  <tr key={i} className="match-row">
                    <td className="match-round">{m.round}</td>
                    <td className="match-opponent">
                      <div className="match-opponent-inner">
                        <span className="match-opponent-name">
                          {flagCode && (
                            <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt="" className="match-flag" />
                          )}
                          {m.opponent}
                        </span>
                        {m.scorers && <span className="match-scorers">{m.scorers}</span>}
                      </div>
                    </td>
                    <td className="match-score">{m.score}</td>
                    <td className={`match-wdl match-wdl--${m.result.toLowerCase()}`}>{m.result}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {(prevYear || nextYear) && (
        <div className="kit-year-nav">
          {prevYear ? (
            <Link to={`/${countryId}/${prevYear}`} className="kit-year-prev">
              <span className="kit-year-nav-arrow">←</span>
              <span className="kit-year-nav-info">
                <span className="kit-year-nav-year">{prevYear}</span>
                <span className="kit-year-nav-headline">{country.kits[prevYear].headline}</span>
              </span>
            </Link>
          ) : <div />}
          {nextYear ? (
            <Link to={`/${countryId}/${nextYear}`} className="kit-year-next">
              <span className="kit-year-nav-info">
                <span className="kit-year-nav-year">{nextYear}</span>
                <span className="kit-year-nav-headline">{country.kits[nextYear].headline}</span>
              </span>
              <span className="kit-year-nav-arrow">→</span>
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
