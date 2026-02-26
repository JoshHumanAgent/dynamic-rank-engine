/**
 * DUPLICATE CHECK SCRIPT
 * Run BEFORE scoring ANY new show
 * 
 * Usage: node scripts/check-duplicate.js "Show Name"
 * 
 * Checks all three files:
 * - data/core/01-current-index.json (Top 100)
 * - data/core/02-overflow-pool.json (Overflow)
 * - data/shows/index.json (Live site)
 */

const fs = require('fs');
const path = require('path');

function readJSON(p) { 
    let c = fs.readFileSync(p, 'utf8'); 
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1); 
    return JSON.parse(c); 
}

function normalize(title) {
    return title.toLowerCase()
        .replace(/\s*\(s\d+[^\)]*\)/gi, '')  // Remove (S1-4)
        .replace(/\s*s\d+(-\d+)?/gi, '')      // Remove S1-4
        .replace(/\s*\(\d{4}\)/gi, '')        // Remove (2024)
        .replace(/[^a-z0-9]/g, '')            // Remove non-alphanumeric
        .trim();
}

function checkDuplicate(searchTitle) {
    const basePath = path.join(__dirname, '..');
    
    // Load all three files
    let top100, overflow, live;
    try {
        top100 = readJSON(path.join(basePath, 'data/core/01-current-index.json'));
    } catch (e) {
        top100 = { shows: [] };
    }
    try {
        overflow = readJSON(path.join(basePath, 'data/core/02-overflow-pool.json'));
    } catch (e) {
        overflow = { shows: [] };
    }
    try {
        live = readJSON(path.join(basePath, 'data/shows/index.json'));
    } catch (e) {
        live = { shows: [] };
    }
    
    const all = [...top100.shows, ...overflow.shows];
    const norm = normalize(searchTitle);
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           DUPLICATE CHECK: ' + searchTitle.padEnd(30) + '║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Normalized search:', norm);
    console.log('');
    
    const matches = [];
    
    // Check each show
    all.forEach(s => {
        const sNorm = normalize(s.title);
        const slugNorm = s.slug.replace(/[^a-z0-9]/g, '');
        
        // Check for matches
        if (sNorm === norm || 
            sNorm.includes(norm) || 
            norm.includes(sNorm) ||
            slugNorm.includes(norm) ||
            norm.includes(slugNorm)) {
            matches.push({
                title: s.title,
                score: s.final,
                rank: s.rank,
                location: s.rank <= 100 ? 'TOP 100' : 'OVERFLOW',
                slug: s.slug
            });
        }
    });
    
    if (matches.length > 0) {
        console.log('┌───────────────────────────────────────────────────────────┐');
        console.log('│  ❌ DUPLICATE FOUND - DO NOT SCORE THIS SHOW              │');
        console.log('├───────────────────────────────────────────────────────────┤');
        matches.forEach(m => {
            console.log('│  ' + m.title.padEnd(35) + '                   │');
            console.log('│  Score: ' + m.score + ' | Rank: #' + m.rank + ' | ' + m.location.padEnd(15) + '       │');
        });
        console.log('└───────────────────────────────────────────────────────────┘');
        console.log('');
        console.log('ACTION: SKIP this show and move to the next one.');
        process.exit(1);
    } else {
        console.log('┌───────────────────────────────────────────────────────────┐');
        console.log('│  ✓ NOT FOUND - Safe to score                             │');
        console.log('└───────────────────────────────────────────────────────────┘');
        console.log('');
        console.log('This show does not exist in:');
        console.log('  • Top 100 (' + top100.shows.length + ' shows)');
        console.log('  • Overflow (' + overflow.shows.length + ' shows)');
        console.log('  • Live site (' + live.shows.length + ' shows)');
        console.log('');
        console.log('You may proceed with scoring this show.');
        process.exit(0);
    }
}

// Get search term from command line
const searchTitle = process.argv[2];
if (!searchTitle) {
    console.log('');
    console.log('Usage: node scripts/check-duplicate.js "Show Name"');
    console.log('');
    console.log('Example: node scripts/check-duplicate.js "Hannibal"');
    process.exit(1);
}

checkDuplicate(searchTitle);