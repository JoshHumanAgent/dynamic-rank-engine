const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json', 'utf8'));
const shows = data.shows;

const required = ['title', 'slug', 'year', 'month', 'genres', 'final', 'char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol', 'episodes', 'poster', 'backdrop', 'streaming'];

let report = {};
required.forEach(field => { report[field] = []; });

shows.forEach(show => {
    required.forEach(field => {
        const val = show[field];
        if (val === undefined || val === null || val === '') {
            report[field].push(show.title || '(no title)');
        }
    });
});

console.log('=== MISSING FIELDS AUDIT ===\n');
required.forEach(field => {
    if (report[field].length > 0) {
        console.log(`❌ ${field} (${report[field].length} missing):`);
        report[field].slice(0, 10).forEach(t => console.log(`   - ${t}`));
        if (report[field].length > 10) console.log(`   ... and ${report[field].length - 10} more`);
    } else {
        console.log(`✅ ${field}: all present`);
    }
});

// Check for NaN finals
const nanFinals = shows.filter(s => isNaN(parseFloat(s.final)));
console.log(`\nNaN finals: ${nanFinals.length}`, nanFinals.map(s => s.title));

// Check streaming structure
const badStreaming = shows.filter(s => s.streaming && (typeof s.streaming.us === 'undefined'));
console.log(`\nBad streaming (no .us): ${badStreaming.length}`, badStreaming.slice(0,5).map(s=>s.title));
