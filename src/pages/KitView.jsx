import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { countries } from "../data/countries.js";

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

function AnnotationDot({ annotation, isActive, onClick }) {
  return (
    <button
      className={`annotation-dot ${isActive ? "annotation-dot--active" : ""}`}
      style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
      onClick={() => onClick(annotation.id)}
      aria-label={annotation.label}
    >
      <span className="annotation-dot-pulse" />
    </button>
  );
}

function AnnotationCard({ annotation, onClose, countryId, kitYears }) {
  if (!annotation) return null;
  return (
    <div className="annotation-card">
      <button className="annotation-card-close" onClick={onClose}>×</button>
      <h3 className="annotation-card-label">{annotation.label}</h3>
      <p className="annotation-card-story">
        <StoryText text={annotation.story} countryId={countryId} kitYears={kitYears} />
      </p>
    </div>
  );
}

function KitPanel({ kit, kitType, countryId, kitYears }) {
  const [activeId, setActiveId] = useState(null);
  const activeAnnotation = kit.annotations?.find((a) => a.id === activeId) || null;
  const handleDotClick = (id) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <div className="kit-panel">
      <div className="kit-image-wrap" style={kit.imageBg ? { background: kit.imageBg } : undefined}>
        {kit.image ? (
          <>
            <img src={kit.image} alt={`${kitType} kit`} className="kit-photo" draggable={false} />
            {kit.annotations?.map((ann) => (
              <AnnotationDot key={ann.id} annotation={ann} isActive={activeId === ann.id} onClick={handleDotClick} />
            ))}
          </>
        ) : (
          <div className="kit-image-placeholder">
            <p>Image coming soon</p>
          </div>
        )}
      </div>

      {kit.imageCredit && (
        <p className="image-credit">
          {kit.imageCredit.player && <strong>{kit.imageCredit.player}</strong>}
          {kit.imageCredit.player && kit.imageCredit.game && " · "}
          {kit.imageCredit.game}
        </p>
      )}

      {kit.image ? (
        <>
          <AnnotationCard
            annotation={activeAnnotation}
            onClose={() => setActiveId(null)}
            countryId={countryId}
            kitYears={kitYears}
          />
          {!activeAnnotation && kit.annotations?.length > 0 && (
            <p className="annotation-hint">
              {kit.annotations.length} annotation{kit.annotations.length !== 1 ? "s" : ""} — tap a dot on the photo to read the story.
            </p>
          )}
        </>
      ) : (
        kit.annotations?.length > 0 && (
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
        )
      )}
    </div>
  );
}

export default function KitView() {
  const { countryId, year } = useParams();
  const country = countries.find((c) => c.id === countryId);
  const yearData = country?.kits?.[Number(year)];
  const kitYears = new Set(Object.keys(country?.kits || {}).map(Number));

  const kitTypes = yearData ? Object.keys(yearData.kits) : [];
  const [activeKit, setActiveKit] = useState(kitTypes[0] || "home");

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

      <div className="kit-view-header">
        <img
          src={`https://flagcdn.com/w40/${country.flagCode}.png`}
          srcSet={`https://flagcdn.com/w80/${country.flagCode}.png 2x`}
          width="40" height="27"
          alt={`${country.name} flag`}
        />
        <div>
          <h1>{country.name} <span className="kit-view-year">{year}</span></h1>
          <p className="kit-view-headline">{yearData.headline}</p>
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

      {currentKit && (
        <KitPanel
          kit={currentKit}
          kitType={activeKit}
          countryId={countryId}
          kitYears={kitYears}
        />
      )}
    </div>
  );
}
