# AGENT BRIEFING — Dynamic Rank Engine
*Read this before touching anything.*

---

## What This Is

A single-page TV drama ranking app. The entire frontend is **one file: `index.html`** (~6,500 lines of HTML + CSS + JS). Shows are loaded dynamically from JSON at runtime. There is no build step — edit and refresh.

---

## File Structure

```
dynamic-rank-engine/
├── index.html                  ← THE APP (all CSS + HTML + JS inline)
├── DIRECTIVE.md                ← Mission rules — read before scoring shows
├── CNAME / robots.txt / sitemap.xml  ← Deployment files
├── assets/                     ← SVG icons only
├── data/
│   ├── shows/
│   │   ├── index.json          ← MASTER DATA — 442 shows, loaded at runtime
│   │   └── *.json              ← Per-show detail JSON (for popup modal)
│   └── discovery/
│       ├── candidates.json     ← Shows in the queue to be evaluated
│       └── rejected.json       ← Shows that didn't make the cut
├── docs/
│   └── shows/
│       └── *.html              ← Per-show narrative HTML pages (457 files)
├── scripts/                    ← Node.js utility scripts
└── memory/
    └── AGENT_BRIEFING.md       ← This file
```

---

## Show Data Schema (`data/shows/index.json`)

```json
{
  "shows": [
    {
      "title": "Breaking Bad",
      "slug": "breaking-bad",
      "year": 2008,
      "month": 1,
      "episodes": 62,
      "genres": ["crime", "drama", "thriller"],
      "char": 9,
      "world": 7,
      "cine": 10,
      "spect": 6,
      "conc": 9,
      "drive": 10,
      "resol": 10,
      "final": 8.95,
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "backdrop": "https://image.tmdb.org/t/p/w780/...",
      "streaming": { "us": ["Netflix"] }
    }
  ]
}
```

All fields are required. `final` must be a **number** (not a string). Category scores are 0–10.

---

## Scoring Formula

```
base = (char×20 + world×15 + cine×15 + spect×10 + conc×15 + drive×15 + resol×10) / 100

Episode multiplier:
  ≤10 eps  → ×0.96
  ≤20 eps  → ×0.95
  ≤30 eps  → ×0.97
  ≤40 eps  → ×1.00
  ≤50 eps  → ×1.02
  ≤60 eps  → ×1.03
  ≤75 eps  → ×1.04
  ≤100 eps → ×1.05
  >100 eps → ×1.06

final = round(base × multiplier, 2)
```

Default weights sum to **100**. The weights above are the defaults — users can adjust them in the UI.

---

## JS Architecture (inside `index.html`)

| Variable | Purpose |
|---|---|
| `shows[]` | Array of all show objects (loaded from JSON) |
| `baseScores{}` | Original scores from JSON — never modified after init |
| `activeScores{}` | Current scores — modified by user slider changes |
| `weights{}` | Current category weights (default: `{char:20, world:15, ...}`) |
| `currentGenres[]` | Active genre filters |
| `currentEras[]` | Active era filters |
| `sortBy` | Current sort mode |
| `multiplierEnabled` | Whether episode multiplier is applied |
| `pinnedShows[]` | Pinned show titles |
| `modifiedShows` | Set of show titles with user overrides |

**Key functions:**
- `loadShowsData()` — fetches index.json, calls initScoreSystem(), then renderShows()
- `initScoreSystem()` — builds baseScores/activeScores, sorts by final, assigns ranks
- `renderShows()` — filters/sorts/renders the show cards into the DOM
- `recalculateWithWeights()` — recalculates all finals with current weights, re-renders
- `saveUserPreferences()` / `loadUserPreferences()` — Firestore sync (logged-in users)

---

## Critical Rules

1. **`final` must be a number** in JSON, never a string like `"8.95"`. String finals crash `.toFixed()`.
2. **Never modify `baseScores`** after init — it's the reference baseline for slider deltas.
3. **`data-show-title` attribute** on cards must exactly match `show.title` — used for event delegation.
4. **Poster URLs**: Always season-specific TMDB URLs. Never call `fetchPosters()` to auto-update — it overwrites curated poster URLs with the show's current main poster.
5. **Slug = HTML filename**: `docs/shows/breaking-bad.html` must match `slug: "breaking-bad"`.
6. **Default weights must sum to 100** — the formula divides by 100.
7. **DIRECTIVE.md rules are sacred** — especially: never re-rank existing Top 100 without explicit instruction.

---

## Scripts Reference

```bash
node scripts/validate.js          # Pre-deploy health check
node scripts/audit-fields.js      # Check all shows have required fields
node scripts/audit-render.js      # Simulate rendering, catch undefined values
node scripts/full-sim.js          # Full end-to-end render simulation
node scripts/health-check.js      # System health overview
node scripts/check-duplicate.js "Title"   # Check for duplicates before adding
node scripts/add-show.js          # Add a new show to index.json
node scripts/generate-html.js     # Generate show HTML pages
node scripts/generate-sitemap.js  # Rebuild sitemap.xml
node scripts/rebuild-index.js     # Rebuild index.json from individual show files
node scripts/backup.js            # Create a timestamped backup
node scripts/discovery-scan.js    # Scan TMDB for new drama candidates
```

---

## Firebase / Firestore

Auth and user preferences are stored in Firestore. The app uses Firebase compat SDK (CDN).

**Firestore document structure** (`users/{uid}`):
```json
{
  "weights": { "char": 20, "world": 15, ... },
  "multiplierEnabled": false,
  "currentGenres": ["all"],
  "currentEras": [],
  "sortBy": "rank",
  "filtersCollapsed": false,
  "pinnedShows": [],
  "scoreOverrides": { "Breaking Bad": { "char": 9.5, "_final": 9.02 } }
}
```

`saveUserPreferences()` does a full `set(data)` (NOT merge). This means it always writes the complete state — no partial updates.

---

## What NOT to Do

- Don't add `batch-*.js` one-off scripts to `scripts/` — use the general-purpose scripts with config
- Don't add commentary docs, reports, or logs to the repo root
- Don't touch `_archived/` or anything in `tvshowsranked/` — that's the old folder
- Don't auto-fetch posters for shows that already have poster URLs
- Don't add a build step or package.json dependencies without asking
- Don't duplicate data between files — `index.json` is the single source of truth
