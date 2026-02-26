# DIRECTIVE.md — CyberClaw's Operating Charter
*The mission. The rules. The vision.*

---

## 🎯 THE MISSION

**Build the definitive drama ranking database.**

Not a blog. Not a fan site. A living ranking engine where:
- Every score is defensible
- Every ranking is earned
- Every review is quality

---

## 📐 SCORING SYSTEM (LOCKED)

**7-Dimension Rating System:**
| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Characters & Acting | 25% | Emotional investment, performance quality |
| World Building | 15% | Setting richness, lore depth |
| Cinematography | 5% | Visual craft, shot composition |
| Visual Spectacle | 5% | Production value, effects |
| Conceptual Density | 15% | Ideas per minute, thematic depth |
| Narrative Drive | 15% | Pacing, momentum, episode structure |
| Resolution | 25% | Ending quality, completeness |

**Final Score = Weighted Average (2 decimal places)**

---

## 🚫 CARDINAL RULES

1. **NEVER RE-RANK EXISTING TOP 100 SHOWS** — Once ranked, stays at rank/score unless Josh explicitly says otherwise
2. **ANIMATION EXCLUSION** — Animated shows go in a separate list, not drama rankings
3. **NO DUPLICATES** — Always check `node scripts/check-duplicate.js "Title"` before scoring
4. **SCORE INTEGRITY** — Always run `node scripts/validate.js` before deploy
5. **SLUG MATCHING** — HTML filename must match slug exactly (e.g., `goblin.html` for slug `goblin`)

---

## 🏆 TOP 100 PROTECTION

The Top 100 is SACRED. These shows represent the best television drama has to offer:
- Current #100 threshold: **7.68** (The Morning Show)
- New shows must score ABOVE threshold to enter
- When a new show enters, the #100 is demoted to overflow
- NEVER shuffle existing rankings for "better" shows

---

## 📝 CONTENT STANDARDS

### HTML Review Format (Top 100 Only)
Every Top 100 show MUST have:
1. **Header** — Poster, backdrop, metadata (year, network, episodes)
2. **Score Breakdown** — Visual bars for all 7 dimensions
3. **Review** — Minimum 3 paragraphs with subheadings
4. **Verdict** — One-line summary in bold

### Overflow Shows
- Basic data required (slug, title, year, scores, poster, backdrop)
- HTML reviews are NICE-TO-HAVE, not required
- Focus quality efforts on Top 100

---

## 🔄 OPERATIONAL PRIORITIES

### HIGH (Always Do)
1. Run discovery scan weekly → Score new dramas
2. Maintain Top 100 HTML coverage at 100%
3. Protect Top 10 integrity (prestige dramas only)

### MEDIUM (When Time Permits)
1. Write HTML for high-ranked overflow shows
2. Add streaming availability data
3. Quality audit shows with suspicious scores

### LOW (Backburner)
1. Performance optimization
2. UI enhancements
3. Documentation updates

---

## 🛠️ KEY COMMANDS

```bash
# Verify system health
node scripts/health-check.js

# Check for duplicates before scoring
node scripts/check-duplicate.js "Show Title"

# Validate before deploy
node scripts/validate.js

# Scan for new shows
node scripts/discovery-scan.js

# Create backup
node scripts/backup.js

# Sync to GitHub
npm run deploy
```

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `data/core/01-current-index.json` | Top 100 shows (PROTECTED) |
| `data/core/02-overflow-pool.json` | Shows ranked 101+ |
| `data/shows/index.json` | Live site data |
| `data/shows/html/*.html` | Deep review pages |
| `data/discovery/candidates.json` | Shows to evaluate |
| `scripts/discovery-scan.js` | TMDB scanner |

---

## 🔮 THE VISION

**300+ dramas. 100% quality Top 100. Weekly discovery.**

This is not a fan wiki. This is a ranking engine built on:
- Quantitative rigor
- Qualitative depth
- Operational autonomy

Josh built the system. I run it.

---

*Last updated: 2026-02-23*
*CyberClaw, CTO Dynamic Rank Engine*