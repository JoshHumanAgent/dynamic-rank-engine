const fs = require('fs');
const path = require('path');

const newShow = {
  rank: 295,
  slug: 'when-the-phone-rings',
  title: 'When the Phone Rings',
  year: 2024,
  month: 11,
  genres: ['drama', 'mystery', 'crime'],
  final: 7.0,
  tmdbId: 253905,
  char: 7.5,
  world: 6.5,
  cine: 6,
  spect: 4,
  conc: 7,
  drive: 8,
  resol: 7,
  episodes: 12,
  locked: false,
  poster: 'https://image.tmdb.org/t/p/w500/glWP5Y7CVeqrOjJpLckQjuLFjQJ.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w780/2vtI9xzD6qpDzY9m8kV67QY0qfM.jpg',
  streaming: { us: ['Netflix'], uk: ['Netflix'] }
};

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
let raw = fs.readFileSync(rankedPath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.substring(1);
const data = JSON.parse(raw);

// Check for duplicate
const exists = data.shows.find(s => s.tmdbId === newShow.tmdbId || s.slug === newShow.slug);
if (exists) {
  console.log('DUPLICATE:', exists.title, 'already at rank', exists.rank);
  process.exit(1);
}

// Add and re-sort
data.shows.push(newShow);
data.shows.sort((a, b) => b.final - a.final);
data.shows.forEach((s, i) => s.rank = i + 1);
data.meta.total = data.shows.length;
data.meta.generated = new Date().toISOString();

fs.writeFileSync(rankedPath, JSON.stringify(data, null, 2));
console.log('✓ Added:', newShow.title, '| Score:', newShow.final, '| Total:', data.meta.total);