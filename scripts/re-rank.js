const fs = require('fs');

// Read files and strip BOM if present
function readJSON(path) {
    let content = fs.readFileSync(path, 'utf8');
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.substring(1);
    }
    return JSON.parse(content);
}

// Read current data from data/core
const top100 = readJSON('data/core/01-current-index.json');
const overflow = readJSON('data/core/02-overflow-pool.json');

// Merge all shows
const allShows = [...top100.shows, ...overflow.shows];

// Sort by final score descending
allShows.sort((a, b) => b.final - a.final);

// Reassign ranks
allShows.forEach((show, index) => {
  show.rank = index + 1;
});

// Split back into Top 100 and Overflow
const newTop100 = allShows.slice(0, 100);
const newOverflow = allShows.slice(100);

// Write updated files
fs.writeFileSync('data/core/01-current-index.json', JSON.stringify({
  shows: newTop100,
  description: 'TOP 100 - Live on website (Re-ranked 2026-02-23)',
  lastUpdated: new Date().toISOString(),
  version: '2.0',
  count: 100
}, null, 2));

fs.writeFileSync('data/core/02-overflow-pool.json', JSON.stringify({
  shows: newOverflow,
  description: 'OVERFLOW - Ranked shows 101-' + allShows.length,
  lastUpdated: new Date().toISOString(),
  version: '3.1',
  count: newOverflow.length
}, null, 2));

console.log('✅ RE-RANK COMPLETE');
console.log('Total shows:', allShows.length);
console.log('\n🔥 NEW TOP 10:');
newTop100.slice(0, 10).forEach(s => {
  const marker = s.final >= 8.0 ? '⭐' : '';
  console.log(`#${s.rank} ${s.title} - ${s.final} ${marker}`);
});

console.log('\n📊 NEW TOP 100 THRESHOLD:', newTop100[99].final);
console.log('📊 OVERFLOW COUNT:', newOverflow.length);
