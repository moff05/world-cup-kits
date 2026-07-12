# Design System — World Cup Archive

## Palette

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#080808` | Page background |
| `--surface` | `#111111` | Card / panel surface |
| `--surface-2` | `#1a1a1a` | Hover surface, nested panels |
| `--border` | `#222222` | Dividers, outlines |
| `--text` | `#f5f5f5` | Primary body text |
| `--text-dim` | `#d8d8d8` | Secondary body text, annotation prose |
| `--text-muted` | `#aaaaaa` | Labels, metadata, captions |
| `--accent` | `#c9a84c` | Gold — year numbers, active states, CTA borders |
| `--accent-dim` | `rgba(201,168,76,0.15)` | Hover backgrounds |
| `--radius` | `6px` | Default corner radius |

**Strategy**: Committed dark. The near-black body (`#080808`) reads as archive / film room, not dashboard. Gold accent carries all emphasis — no competing colors. Contrast ratios: `--text-dim` on `--bg` = 14.7:1; `--text-muted` on `--bg` = 9.3:1; both well above WCAG AA.

## Typography

| Token | Value | Role |
|-------|-------|------|
| `--font` | `'Barlow', system-ui, sans-serif` | Body, UI chrome |
| `--font-display` | `'Barlow Condensed', 'Arial Narrow', sans-serif` | Display headings, year numbers, labels |

Loaded from Google Fonts. Barlow Condensed 800 gives the compressed, wide-print sports-poster energy. Barlow regular serves body without competing.

### Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Home hero h1 | `clamp(56px, 10vw, 96px)` | 800 | Uppercase, `letter-spacing: -0.03em` |
| Country / kit h1 | `clamp(40px, 7vw, 72px)` | 800 | Uppercase, `letter-spacing: -0.03em` |
| Tournament year title | `clamp(72px, 14vw, 120px)` | 800 | Gold accent color |
| Section label | `clamp(11px, 1.4vw, 13px)` | 700 | Uppercase, `letter-spacing: 0.14em` — reserved for section breaks only |
| Fact / annotation label | `clamp(22px, 3vw, 28px)` | 800 | Uppercase, gold |
| Body / prose | `1rem` / `1.0625rem` | 400 | `line-height: 1.7–1.8`, `max-width: 62–68ch` |
| Small metadata | `11–13px` | 400–500 | Plain case, `color: var(--text-muted)` |

**Eyebrow rule**: tracked uppercase (`letter-spacing: 0.10em+`) is reserved for `.section-label` dividers and `.fact-label` headings only. Navigation links, sidebar labels, match headers, and pipeline counters use plain sentence-case.

### Letter-spacing floors
- Display headings: `≥ -0.04em` (current: `-0.03em` ✓)
- Tracked labels: only where explicitly stated above

## Geometry

Two signature moves that distinguish this design:

1. **Diagonal clip-path on image containers** — `clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%)` creates a bottom-right diagonal cut. Used on hero image wraps and some section panels.
2. **Skewed accent rule** — `.site-header::after` with `transform: skewY(-0.8deg)` on the gold 2px rule below the hero. Subtle but creates a kinetic feel.

## Motion

All entrance animations live inside `@media (prefers-reduced-motion: no-preference)`. Content is always visible at default state; animation is enhancement only.

| Animation | Duration | Easing | Target |
|-----------|----------|--------|--------|
| `statFadeUp` | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Stats bar + ext-stats cells (staggered) |
| `photoReveal` | 700ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Kit photos on load |
| Hover transforms | 150ms | `ease` | Nav cards, year prev/next (translateX ±3px) |

Hover transforms have a `prefers-reduced-motion: reduce` override that disables them.

## Components

### Section Label
```css
.section-label {
  font-family: var(--font-display);
  font-size: clamp(11px, 1.4vw, 13px);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  /* Trailing rule via ::after { flex: 1; height: 1px; background: var(--border) } */
}
```
Used for: "Kit Traditions", "World Cup History". Not used for navigation, captions, or sidebar labels.

### Result Badges
Color-coded by finishing position:
- Champions → `var(--accent)` gold
- Runners-up → `#c0c0c0` silver
- 3rd/4th/Semi → `#cd7f32` bronze
- Quarter-final → `var(--text-muted)`
- Earlier → `var(--text-muted)`

### Year Navigation (Kit View Sidebar)
Sticky `240px` column. Shows all tournament years for the current country. Active year highlighted with `var(--accent-dim)` background and gold year number. Hidden on mobile (`< 720px`). Keyboard: `←` / `→` arrow keys navigate between years site-wide.

### Stats Bar
8-column flex row at country dashboard. Count-up animation (`CountUp` component) fires on `IntersectionObserver` intersection. Animation gated in `prefers-reduced-motion: no-preference`.

### Ext-Stats
4-column grid joined flush below the stats bar. Biggest Win, Biggest Loss, Best/Worst Result, Biggest Rival — all computed from match data at runtime.

### Player Tooltip
Inline hover tooltip for referenced players in annotation stories. CSS `position: absolute` box shown on `:hover` / `:focus-within`. No mobile equivalent (touch devices don't hover).

### Featured Strip
Infinite-scroll marquee of 20 curated entries. Auto-scrolls at 0.5px/frame; pauses on `mouseenter`. Click-drag supported with `setPointerCapture` after 6px movement threshold.

## Z-Index Scale

| Layer | Value | Use |
|-------|-------|-----|
| Lightbox | `1000` | Kit photo full-screen view |
| Player tooltip | `200` | Hover tooltip boxes |
| Sticky sidebar | `10` | Kit year list |

## Layout

- Main container: `max-width: 1000px`, `margin: 0 auto`, `padding: 0 20px 80px`
- Kit content grid: `minmax(0, 1fr) 240px` — main panel + sidebar
- Country grid: `repeat(auto-fill, minmax(160px, 1fr))` — flag cards
- Stats bar: `display: flex`, 8 equal columns
- Ext-stats: `display: grid`, `1fr 1fr 1fr 1.2fr` — 4 columns

## Anti-references

- **FIFA.com** — corporate garish navigation hell; zero editorial voice
- **SaaS dashboards** — dark + metric cards + utility energy; wrong register
- **Hypebeast** — drop-culture maximalism; high contrast for its own sake
