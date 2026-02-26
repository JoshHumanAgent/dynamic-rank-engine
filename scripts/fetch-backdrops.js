/**
 * fetch-backdrops.js
 * Fetches TMDB backdrop images for all shows and adds them to index.json + FALLBACK_SHOWS.
 * Run: node scripts/fetch-backdrops.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const API_KEY = 'ca9b21cb89de2d1debed1050f603d7ad';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const indexPath = path.join(ROOT, 'data/shows/index.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  let fetched = 0;
  let missing = 0;
  let noTmdbId = 0;

  for (const show of indexData.shows) {
    if (!show.tmdbId) {
      console.log(`SKIP (no tmdbId): ${show.title}`);
      show.backdrop = '';
      noTmdbId++;
      continue;
    }

    try {
      const url = `https://api.themoviedb.org/3/tv/${show.tmdbId}?api_key=${API_KEY}`;
      const data = await fetchJson(url);

      if (data.backdrop_path) {
        show.backdrop = BACKDROP_BASE + data.backdrop_path;
        console.log(`OK: ${show.title} → ${show.backdrop}`);
        fetched++;
      } else {
        console.log(`NO BACKDROP: ${show.title}`);
        show.backdrop = '';
        missing++;
      }
    } catch (e) {
      console.error(`ERROR: ${show.title} — ${e.message}`);
      show.backdrop = '';
      missing++;
    }

    // Rate limit: 200ms between requests
    await sleep(200);
  }

  // Write updated index.json
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 4), 'utf8');
  console.log(`\n✅ Updated index.json`);
  console.log(`Fetched: ${fetched}, Missing: ${missing}, No TMDB ID: ${noTmdbId}`);

  // Generate updated FALLBACK_SHOWS
  const fallbackLines = indexData.shows.map(s => {
    const genresStr = s.genres.map(g => `"${g}"`).join(', ');
    const posterStr = s.poster || '';
    const backdropStr = s.backdrop || '';
    return `            { rank: ${s.rank}, title: "${s.title.replace(/"/g, '\\"')}", year: ${s.year}, month: ${s.month}, episodes: ${s.episodes}, char: ${s.char}, world: ${s.world}, cine: ${s.cine}, spect: ${s.spect}, conc: ${s.conc}, drive: ${s.drive}, resol: ${s.resol}, final: ${s.final}, genres: [${genresStr}], poster: "${posterStr}", backdrop: "${backdropStr}" }`;
  });

  const fallbackText = `        const FALLBACK_SHOWS = [\n${fallbackLines.join(',\n')}\n        ];`;
  fs.writeFileSync(path.join(ROOT, 'scripts/FALLBACK_OUTPUT.txt'), fallbackText, 'utf8');
  console.log(`✅ Updated FALLBACK_OUTPUT.txt`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
