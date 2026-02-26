# DIRECTIVE — Dynamic Rank Engine

**Read `AGENT_GUIDE.md` first. It supersedes everything in this file.**

---

## The Mission

Build the definitive TV drama ranking database. Every score is defensible. Every ranking is earned. Every review is quality writing.

## The Non-Negotiables

1. **Never re-rank existing shows** without Josh explicitly asking
2. **Never overwrite an existing `docs/shows/*.html` that is larger than 10KB** — it has hand-crafted content
3. **Never auto-update poster URLs** for shows that already have one
4. **`final` must always be a number**, not a string
5. **Run `node scripts/validate.js` before every deploy**
6. **No animated shows** in the drama rankings
7. **Check for duplicates** before adding any show: `node scripts/check-duplicate.js "Title"`
8. **Weights must sum to 100**
9. **Test in a clean browser** (no extensions, incognito) after any change to `index.html`
10. **Ask before any batch operation** that touches more than 5 files

## The Gold Standard

`docs/shows/game-of-thrones-s1-4.html` — this is what every show page should eventually look like.

## Working Directory

`C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/dynamic-rank-engine`

*Last updated: 2026-02-26*
