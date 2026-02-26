# TV Shows Ranked

A curated ranking of prestige television dramas with interactive scoring and streaming data.

**Live Site:** https://joshhumanagent.github.io/tvshowsranked/

## Stats

- **109 shows** currently ranked
- **7-dimension scoring system** with adjustable weights
- **Interactive score sliders** on every show card
- **US/UK streaming availability** for all shows
- **500-show candidate pool** for future expansion

## Project Structure

```
├── index.html              # Main website (single-file app)
├── data/
│   ├── shows/
│   │   ├── index.json      # Master index (109 shows)
│   │   ├── [slug].json     # Individual show files (109)
│   │   ├── by_genre.json   # Genre groupings
│   │   ├── by_era.json     # Era groupings
│   │   ├── by_network.json # Network groupings
│   │   ├── by_status.json  # Status groupings
│   │   ├── by_country.json # Country groupings
│   │   └── rankings_export.csv  # CSV export
│   ├── show_candidates/
│   │   └── candidates_500.json  # Expansion pool
│   └── README.md           # Data documentation
├── docs/
│   ├── shows/              # Human-readable show docs (109)
│   └── methodology/        # Scoring methodology
├── memory/                 # Agent memory & workflow docs
│   ├── 00-START-HERE.md    # Recovery protocol (READ FIRST)
│   ├── 01-SETUP.md         # Start dev server
│   ├── 02-BROWSER.md       # Browser control (NO EXTENSION)
│   ├── 03-SITE-NAV.md      # Navigate site via API
│   ├── 04-GIT.md           # Commit & deploy
│   ├── 05-STATUS.md        # Current state & rankings
│   ├── 06-CHANGES.md       # Feature history
│   ├── 07-DEBUG.md         # 40 tests passed
│   ├── INDEX.md            # Quick reference
│   └── 2026-02-16.md       # Session log
├── scripts/                # Batch processing tools
│   ├── batch-*.js          # Data generation scripts
│   └── check-*.js          # Validation scripts
└── README.md               # This file
```

## Scoring System

Shows are scored across 7 dimensions (0-10 scale):

| Dimension | Weight | Code |
|-----------|--------|------|
| Characters & Acting | 25% | `char` |
| World Building | 15% | `world` |
| Cinematography | 5% | `cine` |
| Visual Spectacle | 5% | `spect` |
| Conceptual Density | 15% | `conc` |
| Narrative Drive | 15% | `drive` |
| Narrative Path & Resolution | 20% | `resol` |

Episode count multipliers adjust final scores based on show length.

## Interactive Features

- **Weight Sliders**: Adjust category weights in real-time
- **Score Sliders**: Modify individual show scores (stored in localStorage)
- **Export/Import**: Save and share custom rankings as JSON
- **Filters**: By genre, era, network, status, country
- **Search**: Full-text search across titles
- **Pinned Shows**: Keep favorites at the top

## Data Sources

- **Ratings**: IMDb, Rotten Tomatoes, Metacritic
- **Posters**: TMDB (The Movie Database)
- **Streaming**: JustWatch integration

## Status

🟢 **Active** — Regular updates with new shows and streaming data

## Recent Changes

- **2026-02-16**: Agent-native instrumentation — full browser control via `tvshowsAgent` API
- **2026-02-16**: UI refinements: compact search bar, methodology button reposition, episode multiplier featured
- **2026-02-16**: Weight adjustments: Characters 25%, Spectacle/Cinematography 5% each, Resolution 20%
- **2026-02-15**: Added interactive per-category score sliders on every show card
- **2026-02-15**: Added streaming availability (US/UK) for all 109 shows
- **2026-02-15**: Generated index files by genre, era, network, status, country
- **2026-02-14**: Added 9 new shows (109 total)

## License

Data © 2026 — Curated ranking system with original scoring methodology
