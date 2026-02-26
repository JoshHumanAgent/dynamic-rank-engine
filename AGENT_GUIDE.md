# AGENT GUIDE — Dynamic Rank Engine
**Read this entire document before doing anything. No exceptions.**

---

## 1. THE MISSION

Build the definitive TV drama ranking database. Not a blog, not a fan site — a living ranking engine where every score is defensible, every ranking is earned, and every review is quality writing.

The site ranks drama series using a 7-dimension algorithmic scoring system. Users can customise weights, filter by genre/era, and explore detailed show analysis via popup cards.

**The gold standard for what this site should look and feel like: `docs/shows/game-of-thrones-s1-4.html`** — read it. Every other show page should eventually reach that level of quality.

---

## 2. THE CODEBASE

### What it is
- **One file runs the entire frontend: `index.html`** (~6,500 lines, all CSS + HTML + JS inline)
- No build step. No npm. No framework. Edit the file, refresh the browser.
- Show data is fetched at runtime from `data/shows/index.json`

### Directory structure
```
dynamic-rank-engine/
├── index.html                     ← THE ENTIRE APP
├── AGENT_GUIDE.md                 ← THIS FILE
├── CNAME / robots.txt / sitemap.xml / .gitignore
├── assets/                        ← SVGs only (4 files)
├── data/
│   ├── shows/
│   │   ├── index.json             ← MASTER DATA — all 442 shows
│   │   └── *.json                 ← Per-show detail JSON (for popup modal)
│   └── discovery/
│       ├── candidates.json        ← Shows queued for evaluation
│       └── rejected.json          ← Shows that didn't qualify
├── docs/
│   └── shows/
│       └── *.html                 ← Per-show narrative pages (457 files)
├── scripts/                       ← Node.js utility scripts
└── memory/
    └── AGENT_BRIEFING.md          ← Technical quick-reference
```

---

## 3. SHOW DATA — THE SCHEMA

Every show in `data/shows/index.json` must have ALL of these fields:

```json
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
  "poster": "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
  "backdrop": "https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
  "streaming": { "us": ["Netflix"] }
}
```

**Critical data rules:**
- `final` MUST be a **number**, never a string. `"8.95"` will crash the app. `8.95` is correct.
- `slug` must exactly match the filename in `docs/shows/` (e.g., slug `breaking-bad` → `docs/shows/breaking-bad.html`)
- `poster` and `backdrop` must be season-specific TMDB URLs — do NOT auto-fetch to replace them
- All 7 category scores (`char`, `world`, `cine`, `spect`, `conc`, `drive`, `resol`) are required, as numbers 0–10
- `genres` is an array of strings

---

## 4. THE SCORING FORMULA

```
base = (char×20 + world×15 + cine×15 + spect×10 + conc×15 + drive×15 + resol×10) / 100

Episode multiplier (applied if enabled):
  ≤10 eps  → ×0.96    ≤50 eps  → ×1.02
  ≤20 eps  → ×0.95    ≤60 eps  → ×1.03
  ≤30 eps  → ×0.97    ≤75 eps  → ×1.04
  ≤40 eps  → ×1.00    ≤100 eps → ×1.05
                       >100 eps → ×1.06

final = round(base × multiplier, 2)
```

**The default weights sum to exactly 100.** If you change weights, verify they still sum to 100 or the formula breaks.

The 7 dimensions and what they measure:
| Key | Label | Weight | Measures |
|-----|-------|--------|---------|
| `char` | Characters & Acting | 20% | Depth of characterisation, performance quality, psychological believability |
| `world` | World Building | 15% | How fully realised the world feels, consistency of rules and institutions |
| `cine` | Cinematography | 15% | Visual craft, intentional framing, distinctive visual language |
| `spect` | Visual Spectacle | 10% | Scale, production design, immersive or striking imagery |
| `conc` | Conceptual Density | 15% | Breadth of ideas dramatised through story — political, philosophical, social |
| `drive` | Narrative Drive | 15% | Pacing, clarity of stakes, whether each episode advances the story |
| `resol` | Narrative Path & Resolution | 10% | How well the show fulfils its narrative promises, quality of closure |

---

## 5. THE APP — HOW IT WORKS

### JS State Variables (inside `index.html`)
| Variable | What it is |
|----------|-----------|
| `shows[]` | All show objects loaded from JSON |
| `baseScores{}` | Original scores from JSON — **read-only after init** |
| `activeScores{}` | Current scores — updated by user slider changes |
| `weights{}` | Current category weights |
| `currentGenres[]` | Active genre filters (default: `['all']`) |
| `currentEras[]` | Active era filters (default: `[]` = all eras) |
| `sortBy` | Sort mode: `'rank'`, `'score-desc'`, `'score-asc'`, `'year-desc'`, `'year-asc'`, `'title'` |
| `multiplierEnabled` | Boolean — whether episode multiplier is applied |
| `pinnedShows[]` | Pinned show titles |
| `modifiedShows` | Set of show titles with user score overrides |
| `minScore` | Minimum final score to show in list (default: 6.5) |
| `searchTerm` | Current search string |

### Key Functions
| Function | What it does |
|----------|-------------|
| `loadShowsData()` | Fetches index.json, coerces string finals to numbers, calls initScoreSystem(), then renderShows() |
| `initScoreSystem()` | Builds baseScores/activeScores from JSON, sorts shows by final, assigns ranks 1–N |
| `renderShows()` | Filters shows by minScore/search/genre/era, sorts, slices to top 100, renders cards to DOM |
| `recalculateWithWeights()` | Recalculates all final scores using activeScores + current weights, re-sorts, re-renders |
| `openShowDetail(show)` | Opens the popup modal — fetches `docs/shows/{slug}.html` for narrative content |
| `saveUserPreferences()` | Writes all state to Firestore (full set, not merge) |
| `loadUserPreferences()` | Reads Firestore state and applies it — called after auth |

### The Show Card Popup
When a user clicks a show card, `openShowDetail()` fires. It:
1. Shows an immediate loading state with the show's score and meta
2. Fetches `docs/shows/{slug}.html` — if it exists, extracts narrative and dimension sections
3. Fetches `data/shows/{slug}.json` — if it exists, shows external ratings (IMDB, RT, Metacritic)
4. Renders everything into the modal

If no HTML file exists for a show, the popup shows a basic "coming soon" message. **This is the gap we are trying to close — more shows need their HTML file.**

### Filters — How They Work
- **Era filter**: chips at the top — `2020s`, `2010s`, `2000s`, `pre2000`, `last3mo`, `last6mo`, `thisYear`
  - Time-based eras (`last3mo`, `last6mo`, `thisYear`) check against `show.year` + `show.month`
  - Decade eras check `getEra(show.year, show.month)` for exact match
  - Multiple eras can be active at once (OR logic)
- **Genre filter**: pills below era — multiple genres can be active (AND logic — show must match ALL selected)
- **Sort**: dropdown — rank, score high/low, year new/old, alphabetical
- **Search**: text input — matches against `show.title`
- All filters combine with AND logic (a show must pass ALL active filters)

---

## 6. CONTENT QUALITY STANDARD

### The Gold Standard: Game of Thrones (S1-4)
Open `docs/shows/game-of-thrones-s1-4.html` and study it. This is what every show page should eventually look like. It has:
- A styled hero section with rank badge, title, and tagline
- Full score breakdown with visual bars for all 7 dimensions
- Multiple sections of substantive written analysis (why the show is great, what makes each dimension score what it does)
- Specific episode references, character names, and writing that treats the reader as intelligent
- A clear verdict

### What the basic template looks like (BAD)
The agent-generated replacement files are ~8KB and contain only:
- A generic header
- A score table
- A one-paragraph description written without any real analysis

### Quality tiers for show pages
| Tier | Size | Content |
|------|------|---------|
| Gold (target) | 25KB+ | Full analysis, dimension breakdowns, narrative writing, specific references |
| Acceptable | 12–25KB | Solid narrative paragraphs, dimension notes, real opinions |
| Basic (agent-generated, needs improvement) | <10KB | Generic template — replace when time permits |
| Missing | No file | Add when show enters Top 100 |

### Rules for writing show pages
1. **Never overwrite an existing file that is larger than 10KB.** If it already exists and is detailed, leave it alone.
2. Only generate new files for shows that have NO existing HTML file.
3. Write in the voice of someone who has actually watched the show and thought about it.
4. Reference specific episodes, characters, arcs, and moments.
5. The dimension breakdown should explain WHY the score is what it is — not just restate the score.
6. Do not use filler phrases like "this show is a masterpiece" without explaining why.

---

## 7. DEBUGGING THE WEBSITE

### Before debugging anything — use the browser properly

**How to test the site:**
1. Serve it locally: `npx serve .` or `python -m http.server 8080` from the project root
2. Open `http://localhost:8080` (or whatever port)
3. **Use a clean browser window with no extensions** — extensions can interfere with Firebase auth, fetch requests, and rendering. Use a private/incognito window, or a browser profile with no extensions installed.
4. Open DevTools (F12) → Console tab — watch for errors while testing
5. Open DevTools → Network tab — watch for failed fetches (red rows)

**Do not use browser extensions for web fetching or testing.** Use `WebFetch` tool or `curl` for programmatic checks.

### Common issues and how to debug them

**Shows not appearing / list is empty**
- Open browser console — look for fetch errors or JS TypeErrors
- Run `node scripts/full-sim.js` — simulates the render pipeline, reports issues
- Check `data/shows/index.json` — look for `"final": "8.95"` (string instead of number). String finals crash `.toFixed()` and break the entire render.
- Check that `shows.length > 0` in console after page load

**"undefined" appearing in show cards**
- Run `node scripts/audit-render.js` — checks all 442 shows for missing/null/undefined fields
- Run `node scripts/audit-fields.js` — checks required fields across all shows
- The most common cause: a category score (`char`, `world`, etc.) is `undefined` or `null` in JSON
- Second most common: `final` is a string, causing a crash mid-render that leaves partial content

**Era filters not working (e.g. "last 3 months" shows nothing)**
- Check `show.month` field — if it's `null` or missing, `showInTimeEra()` will fail silently
- Check `show.year` — must be a number, not a string
- In the console run: `shows.filter(s => !s.month)` — lists shows missing month data
- The `last3mo` / `last6mo` / `thisYear` filters use `show.year` and `show.month` together. If `month` is 0 or null, the show will never match time-based filters.

**Genre filters returning wrong results**
- `show.genres` must be an array. If it's a string or null, genre filtering crashes silently.
- Check in console: `shows.filter(s => !Array.isArray(s.genres))` — should return `[]`
- Genre matching is AND logic — selecting "crime" AND "drama" only shows shows that have BOTH

**Poster showing wrong image (e.g. True Detective showing Night Country)**
- This happens when `fetchPosters()` is called — it overwrites season-specific poster URLs
- **Never call `fetchPosters()`** — the existing poster URLs are curated by hand
- Fix: manually set the correct TMDB season poster URL in `index.json`

**Show detail popup showing basic content instead of detailed analysis**
- Check file size: `ls -la docs/shows/{slug}.html` — if it's ~8KB, the agent replaced the detailed version
- Check `_archived/backups/backup-2026-02-22T10-31-34/docs/shows/` for the original
- Restore: `cp _archived/backups/.../docs/shows/{slug}.html docs/shows/{slug}.html`

**Firebase auth not working / preferences not loading**
- Check browser console for Firebase errors
- Make sure `firebaseConfig` in `index.html` has valid credentials
- `loadUserPreferences()` is only called when `currentUser` is set — if auth hasn't fired, preferences won't load
- `db.enablePersistence()` may throw in private/incognito mode — this is expected, the app handles it

**Scores look wrong after weight change**
- Verify weights sum to 100: in console, `Object.values(weights).reduce((a,b)=>a+b,0)` should return `100`
- `recalculateWithWeights()` uses `activeScores`, not the raw JSON — user overrides are included
- `baseScores[title].final` is the unmultiplied reference used for delta calculations — don't touch it

### Validation scripts — run these before any deploy

```bash
node scripts/validate.js          # Full system health check — run before EVERY deploy
node scripts/audit-fields.js      # All shows have required fields
node scripts/audit-render.js      # No undefined values in rendering pipeline
node scripts/full-sim.js          # End-to-end render simulation for top 100
node scripts/health-check.js      # Quick overview
node scripts/check-duplicate.js "Title"  # Check before adding any show
```

**All of these must pass before committing or deploying.**

---

## 8. CARDINAL RULES — NEVER BREAK THESE

These rules exist because they have been broken before and caused real damage.

### Data rules
1. **`final` must always be a number, never a string.** Check with `typeof show.final === 'number'` before saving any show. String finals crash the entire render pipeline.
2. **Never re-rank existing shows without Josh explicitly asking.** Once a show has a rank and score, it stays. Do not "improve" the rankings on your own initiative.
3. **No animated shows in the drama rankings.** Animated series go on a separate list. Do not add them to `index.json`.
4. **Check for duplicates before adding any show.** Run `node scripts/check-duplicate.js "Title"` first.
5. **Default weights must sum to 100.** The scoring formula divides by 100. If weights sum to 95, every score is artificially lowered by 5%.

### File rules
6. **NEVER overwrite an existing `docs/shows/*.html` file that is larger than 10KB.** These contain hand-crafted narrative content. The agent has destroyed these before and they had to be restored from backup. If you are generating HTML, check the file size first — if it exists and is detailed, leave it alone.
7. **NEVER call `fetchPosters()` or auto-update poster URLs for shows that already have a poster.** TMDB returns the show's current main poster, which is often wrong for season-specific entries (e.g. True Detective S1 gets replaced with Night Country's poster).
8. **The slug must exactly match the HTML filename.** `slug: "breaking-bad"` → `docs/shows/breaking-bad.html`. Mismatch means the popup can never load the detailed content.

### Code rules
9. **Do not add one-off batch scripts to `scripts/`.** We cleaned this up — 148 scripts down to 22. Use the existing general-purpose scripts.
10. **Do not add instrumentation, monitoring wrappers, or analytics code to `index.html` without asking.** A previous agent added a `renderShows` wrapper that referenced undefined variables and threw errors on every render.
11. **Do not add new npm dependencies or a package.json build step without asking.** The site has no build step by design.
12. **Do not create commentary files, reports, logs, or notes in the project root.** The root is clean — keep it that way.

### Process rules
13. **Always test in the browser after making changes to `index.html`.** Serve locally, open DevTools, check for console errors, and actually use the filters and popups.
14. **Run `node scripts/validate.js` before every deploy.**
15. **If a task would modify more than 5 files at once, check with Josh first.** Batch operations have caused the most damage in this project.

---

## 9. CONTENT PRIORITIES

### Right now the site has:
- 442 shows in `index.json`
- 457 HTML show pages in `docs/shows/`
- ~75 of those pages are detailed (20KB+)
- ~200 are medium quality (8–20KB)
- ~180 are basic agent-generated templates (<8KB) that need replacing

### Priority order for new/improved HTML content:
1. **Top 20 shows** — all should be Gold tier. Check which ones are still basic.
2. **Shows ranked 21–100** — should all reach Acceptable tier at minimum.
3. **Shows ranked 101–200** — nice to have, not urgent.
4. **Shows below 200** — basic template is fine.

### When writing a new show page:
- Study `docs/shows/game-of-thrones-s1-4.html` as the template for structure and tone
- The page is served inside the popup modal — the CSS in the individual HTML file is also loaded
- Extract the "What It Feels Like to Watch" section first — this is what appears in the popup narrative area
- The "Why It Ranks" / "Seven Dimensions" section is extracted separately for the dimension breakdown
- Use `DOMParser` — the app parses the HTML client-side to extract these sections by heading text

---

## 10. FIRESTORE / AUTH

The app uses Firebase Authentication (Google + Email/Password) and Firestore for user preference sync.

**Firestore document** (`users/{uid}`):
```json
{
  "weights": { "char": 20, "world": 15, "cine": 15, "spect": 10, "conc": 15, "drive": 15, "resol": 10 },
  "multiplierEnabled": false,
  "currentGenres": ["all"],
  "currentEras": [],
  "sortBy": "rank",
  "filtersCollapsed": false,
  "pinnedShows": [],
  "scoreOverrides": {
    "Breaking Bad": { "char": 9.5, "_final": 9.02 }
  }
}
```

- `saveUserPreferences()` does a **full `set(data)`** — NOT `{merge: true}`. The entire document is replaced each save.
- `loadUserPreferences()` always calls `resetAllState()` first to start from a clean slate before applying saved preferences.
- Firestore persistence (`enablePersistence`) is enabled for offline support — it may log a warning in incognito mode, which is normal.
- The Admin UID (`ADMIN_UID` in `index.html`) gets access to the Master Export button.

---

## 11. DEPLOYMENT

The site deploys to GitHub Pages via the `CNAME` file.

```bash
# Before deploying:
node scripts/validate.js       # Must pass clean
node scripts/generate-sitemap.js  # Rebuild sitemap if shows changed

# Deploy:
git add -A
git commit -m "Description of changes"
git push origin main
```

GitHub Pages serves from the root of the `main` branch. The `CNAME` points to the custom domain.

---

## 12. WHAT THE PREVIOUS AGENT DID WRONG (learn from this)

These are real mistakes made by autonomous agents in previous sessions that caused hours of cleanup:

| What they did | What broke | How it was fixed |
|--------------|-----------|-----------------|
| Added 326 shows overnight without checking | String `"final"` values in JSON crashed `.toFixed()`, breaking the entire render | Manual coercion fix + data cleanup script |
| Regenerated 75 existing `docs/shows/*.html` files with basic templates | Lost months of hand-written narrative content | Restored from dated backup in `_archived/` |
| Added `renderShows` wrapper with `filteredShows.length` (undefined variable) | ReferenceError thrown on every single render call | Fixed the undefined reference |
| Added agent instrumentation referencing `currentEra`, `currentGenre`, `useEpisodeMultiplier` | Wrong variable names — correct names are `currentEras`, `currentGenres`, `multiplierEnabled` | Fixed all three variable names |
| Called `fetchPosters()` on existing shows | Season-specific poster URLs replaced with wrong show-level images | Manual URL restoration |
| Created 148 scripts in `scripts/` | Directory became unusable bloat | Cleaned to 22 essential scripts |

**The pattern in all of these:** the agent ran a batch operation without checking existing state first.

**The rule:** Always check what already exists before creating or overwriting anything.

---

*Last updated: 2026-02-26*
*Working directory: `C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/dynamic-rank-engine`*
