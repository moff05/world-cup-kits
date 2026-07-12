import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { countries } from "../data/index.js";
import { opponentCountryId } from "../utils/opponentLookup.js";

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

function abbrevRound(round) {
  if (!round) return "";
  const r = round.toLowerCase();
  if (r === "final") return "F";
  if (r.includes("semi")) return "SF";
  if (r.includes("quarter")) return "QF";
  if (r === "round of 16") return "R16";
  if (r === "round of 32") return "R32";
  if (r === "3rd place") return "3rd";
  if (r === "2nd round") return "2R";
  if (r.includes("group")) return "GS";
  return round.substring(0, 3).toUpperCase();
}

const PLAYERS = {
  "Pelé": "Brazilian striker who won three World Cups (1958, 1962, 1970) — the only player ever to do so. Scored 77 goals in 92 appearances for Brazil.",
  "Maradona": "Argentina captain at the 1986 World Cup. Scored the Hand of God and the Goal of the Century in the same quarter-final match against England.",
  "Messi": "Argentina's all-time scorer and six-time Ballon d'Or winner. Won the 2022 World Cup in Qatar to complete the only honour that had eluded him.",
  "Ronaldo": "Brazilian striker who won World Cups in 1994 and 2002, scoring 15 goals across four tournaments — a record at the time of his retirement.",
  "Zidane": "France's talismanic midfielder. Scored twice in the 1998 final and was named Player of the Tournament in 2006, where he headbutted Materazzi in the final.",
  "Cruyff": "Netherlands forward and architect of Total Football. Dominated the 1974 World Cup but refused to play in 1978, citing objections to Argentina's military junta.",
  "Beckenbauer": "West Germany's sweeping libero who lifted the 1974 trophy as captain, then managed Germany to the 1990 title — one of only three men to win as both player and manager.",
  "Müller": "West Germany striker who scored 14 World Cup goals across 1970 and 1974 — a record that stood for 32 years until Ronaldo broke it.",
  "Kempes": "Argentina's striker at the 1978 home World Cup. Scored six goals including twice in the final against Netherlands to win both the Golden Boot and the tournament.",
  "Stábile": "Argentina's last-minute replacement at the inaugural 1930 World Cup. Uncapped before the tournament, he scored a hat-trick on debut and finished as top scorer with eight goals.",
  "Ghiggia": "Uruguay's right-winger who scored the goal that silenced 200,000 fans in the Maracanã in 1950. His low shot past Barbosa is the most famous moment in World Cup history.",
  "Eusébio": "Portugal's top scorer at the 1966 World Cup with nine goals. Won the Golden Boot despite Portugal losing the semi-final to England.",
  "Hurst": "England's Geoff Hurst remains the only player to score a hat-trick in a World Cup final, netting three times as England beat West Germany 4–2 at Wembley in 1966.",
  "Platini": "France's captain and playmaker in the 1980s. Scored five goals at the 1982 World Cup, where France lost a devastating semi-final to West Germany on penalties.",
  "Baggio": "Italy's Roberto Baggio carried his side to the 1994 final almost single-handedly, then missed the decisive penalty in the shootout against Brazil.",
  "Bergkamp": "Netherlands forward whose last-minute control-and-volley against Argentina in the 1998 quarter-final is routinely voted the greatest World Cup goal ever scored.",
  "Mbappé": "France forward who became the second teenager after Pelé to score in a World Cup final, netting against Croatia in 2018. Won the 2022 Golden Boot with eight goals.",
  "Jairzinho": "Brazil's right-winger at the 1970 World Cup who scored in every single match — the only player in history to achieve that feat across an entire tournament.",
  "Garrincha": "Brazil's right-winger whose dribbling dismantled Chile and England at the 1962 World Cup. Led Brazil to the title while Pelé was injured, sharing the Golden Boot.",
  "Rossi": "Italy's Paolo Rossi returned from a two-year match-fixing ban to score a hat-trick against Brazil in 1982, then added goals in the semi-final and final.",
  "Klose": "Germany's Miroslav Klose retired as the all-time World Cup top scorer with 16 goals across four tournaments from 2002 to 2014.",
  "Götze": "Germany's Mario Götze came off the bench in the 2014 final and scored the only goal in extra time against Argentina — his first touch as substitute.",
  "Rahn": "West Germany's Helmut Rahn scored both goals in the 1954 final against Hungary, completing the Miracle of Bern — a 3–2 comeback against the previously unbeaten favourites.",
  "Lamine Yamal": "Spain's teenage winger who became the youngest scorer at a major tournament at Euro 2024. A central figure in Spain's 2026 World Cup campaign aged 18.",
};

function PlayerTooltip({ name, bio }) {
  return (
    <span className="player-tooltip-wrap">
      <span className="player-tooltip-trigger">{name}</span>
      <span className="player-tooltip-box" role="tooltip">
        <strong className="player-tooltip-name">{name}</strong>
        {bio}
      </span>
    </span>
  );
}

function parsePlayersInText(segment, segKey) {
  const names = Object.keys(PLAYERS);
  names.sort((a, b) => b.length - a.length);
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "g");

  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(segment)) !== null) {
    if (m.index > last) parts.push(segment.slice(last, m.index));
    parts.push(<PlayerTooltip key={`${segKey}-p${m.index}`} name={m[1]} bio={PLAYERS[m[1]]} />);
    last = m.index + m[0].length;
  }
  parts.push(segment.slice(last));
  return parts;
}

function StoryText({ text, countryId, kitYears }) {
  const parts = [];
  const yearRegex = /\b(1[89]\d{2}|20\d{2})\b/g;
  let lastIndex = 0;
  let match;
  while ((match = yearRegex.exec(text)) !== null) {
    const year = Number(match[1]);
    if (kitYears.has(year)) {
      if (match.index > lastIndex) {
        parts.push(...parsePlayersInText(text.slice(lastIndex, match.index), `seg${lastIndex}`));
      }
      parts.push(
        <Link key={`y${match.index}`} to={`/${countryId}/${year}`} className="story-year-link">
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }
  }
  parts.push(...parsePlayersInText(text.slice(lastIndex), `seg${lastIndex}`));
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
    if (country && year) document.title = `${country.name} ${year} · World Cup Archive`;
    return () => { document.title = "World Cup Archive"; };
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
        <Link to={`/year/${year}`} className="back-link">{year} World Cup</Link>
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
                const oppId = opponentCountryId(m.opponent);
                return (
                  <tr key={i} className="match-row">
                    <td className="match-round">{m.round}</td>
                    <td className="match-opponent">
                      <div className="match-opponent-inner">
                        <span className="match-opponent-name">
                          <span className="match-round-badge">{abbrevRound(m.round)}</span>
                          {flagCode && (
                            <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt="" className="match-flag" />
                          )}
                          {oppId ? (
                            <Link to={`/${oppId}`} className="opponent-link">{m.opponent}</Link>
                          ) : m.opponent}
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
