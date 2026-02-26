const fs = require('fs');
const path = require('path');

// ANSI colors for output
const R = '\x1b[31m';  // Red
const G = '\x1b[32m';  // Green  
const Y = '\x1b[33m';  // Yellow
const C = '\x1b[36m';  // Cyan
const X = '\x1b[0m';   // Reset

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
    return JSON.parse(c);
}

console.log(C + '╔══════════════════════════════════════════════════════════════╗' + X);
console.log(C + '║     DYNAMIC RANK ENGINE - VALIDATION & DEBUG SYSTEM          ║' + X);
console.log(C + '╚══════════════════════════════════════════════════════════════╝' + X);
console.log();

let errors = 0;
let warnings = 0;

// Load current files (NEW STRUCTURE)
let ranked, foundation, queue;
try {
    ranked = readJSON('data/core/ranked.json');
    console.log(G + '✓' + X + ' Ranked loaded: ' + ranked.shows.length + ' shows (' + ranked.meta.lockedCount + ' locked)');
} catch(e) {
    console.log(R + '✗ ERROR:' + X + ' Cannot load ranked.json: ' + e.message);
    process.exit(1);
}

try {
    foundation = readJSON('data/core/00-foundation-list.json');
    console.log(G + '✓' + X + ' Foundation loaded: ' + foundation.shows.length + ' sacred shows');
} catch(e) {
    console.log(Y + '! WARNING:' + X + ' Cannot load foundation: ' + e.message);
    warnings++;
}

try {
    queue = readJSON('data/core/queue.json');
    console.log(G + '✓' + X + ' Queue loaded: ' + queue.meta.total + ' candidates');
} catch(e) {
    console.log(Y + '! WARNING:' + X + ' Cannot load queue: ' + e.message);
}

console.log();
console.log(C + '── CHECK 1: True Detective S1 Integrity ─────────────────────' + X);
const td = ranked.shows.find(s => s.slug === 'true-detective-s1');
if (!td) {
    console.log(R + '✗ CRITICAL:' + X + ' True Detective S1 NOT FOUND in ranked!');
    errors++;
} else {
    console.log(G + '✓' + X + ' True Detective S1 found at rank #' + td.rank);
    
    const required = ['poster', 'backdrop', 'tmdbId', 'final', 'char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];
    const missing = required.filter(f => !td[f] && td[f] !== 0);
    if (missing.length > 0) {
        console.log(R + '✗ ERROR:' + X + ' True Detective S1 missing fields: ' + missing.join(', '));
        errors++;
    } else {
        console.log(G + '✓' + X + ' All required fields present');
    }
}

console.log();
console.log(C + '── CHECK 2: Top 5 Integrity ──────────────────────────────────' + X);
const top5 = ranked.shows.slice(0, 5);
const expectedTop = ['game-of-thrones-s1-4', 'breaking-bad', 'the-wire', 'better-call-saul', 'the-sopranos'];
top5.forEach((s, i) => {
    if (s.slug === expectedTop[i]) {
        console.log(G + '✓' + X + ' #' + s.rank + ' ' + s.title + ' (' + s.final + ')');
    } else {
        console.log(Y + '! WARNING:' + X + ' #' + s.rank + ' ' + s.title + ' (expected ' + expectedTop[i] + ')');
        warnings++;
    }
});

console.log();
console.log(C + '── CHECK 3: Duplicate Slugs ─────────────────────────────────' + X);
const slugCounts = {};
ranked.shows.forEach(s => {
    slugCounts[s.slug] = (slugCounts[s.slug] || 0) + 1;
});
const duplicates = Object.entries(slugCounts).filter(([k, v]) => v > 1);
if (duplicates.length > 0) {
    console.log(R + '✗ CRITICAL:' + X + ' Duplicate slugs found:');
    duplicates.forEach(([slug, count]) => console.log('  - ' + slug + ' appears ' + count + ' times'));
    errors++;
} else {
    console.log(G + '✓' + X + ' No duplicate slugs found');
}

console.log();
console.log(C + '── CHECK 4: Rank Integrity ───────────────────────────────────' + X);
let rankErrors = 0;
ranked.shows.forEach((s, i) => {
    const expectedRank = i + 1;
    if (s.rank !== expectedRank) {
        console.log(Y + '! WARNING:' + X + ' ' + s.slug + ': rank ' + s.rank + ' should be ' + expectedRank);
        rankErrors++;
    }
});
if (rankErrors === 0) {
    console.log(G + '✓' + X + ' All ' + ranked.shows.length + ' ranks correct (sorted by score)');
} else {
    console.log(Y + '! ' + rankErrors + ' shows have incorrect rank numbers' + X);
    warnings++;
}

console.log();
console.log(C + '── CHECK 5: Poster URLs ──────────────────────────────────────' + X);
let urlErrors = 0;
ranked.shows.forEach(s => {
    if (!s.poster || !s.poster.includes('tmdb.org')) {
        console.log(Y + '! WARNING:' + X + ' ' + s.slug + ' missing/invalid poster');
        urlErrors++;
    }
});
if (urlErrors === 0) {
    console.log(G + '✓' + X + ' All posters valid');
} else {
    console.log(Y + '! ' + urlErrors + ' shows missing/invalid posters' + X);
    warnings++;
}

console.log();
console.log(C + '── CHECK 6: Math Verification (Sample) ───────────────────────' + X);
// Weights: char:20%, world:15%, cine:15%, spect:10%, conc:15%, drive:15%, resol:10%
function calcFinal(show) {
    const base = (show.char * 0.20) + (show.world * 0.15) + (show.cine * 0.15) + 
                 (show.spect * 0.10) + (show.conc * 0.15) + (show.drive * 0.15) + 
                 (show.resol * 0.10);
    const eps = show.episodes || 40;
    let mult = 1.0;
    if (eps <= 10) mult = 0.96;
    else if (eps <= 20) mult = 0.95;
    else if (eps <= 30) mult = 0.97;
    else if (eps <= 40) mult = 1.00;
    else if (eps <= 50) mult = 1.02;
    else if (eps <= 60) mult = 1.03;
    else if (eps <= 75) mult = 1.04;
    else if (eps <= 100) mult = 1.05;
    else mult = 1.06;
    return Math.round(base * mult * 100) / 100;
}

let mathErrors = 0;
ranked.shows.slice(0, 20).forEach(s => {
    const calculated = calcFinal(s);
    if (Math.abs(calculated - s.final) > 0.01) {
        console.log(R + '✗ ERROR:' + X + ' ' + s.slug + ': final=' + s.final + ' calculated=' + calculated);
        mathErrors++;
    }
});
if (mathErrors === 0) {
    console.log(G + '✓' + X + ' Math verified for top 20 shows');
} else {
    errors++;
}

console.log();
console.log(C + '── CHECK 7: Locked Shows Integrity ──────────────────────────' + X);
const lockedShows = ranked.shows.filter(s => s.locked === true);
console.log(G + '✓' + X + ' ' + lockedShows.length + ' locked shows (sacred)');

// Verify locked shows match foundation (if foundation has shows array)
if (foundation && foundation.shows) {
    const foundationSlugs = new Set(foundation.shows.map(s => s.slug));
    const lockedSlugs = new Set(lockedShows.map(s => s.slug));
    const missingLocks = [...foundationSlugs].filter(s => !lockedSlugs.has(s));
    if (missingLocks.length > 0) {
        console.log(Y + '! WARNING:' + X + ' ' + missingLocks.length + ' foundation shows not locked');
    }
} else if (foundation && foundation.baseScores) {
    // Foundation has baseScores object - count the keys as show count
    console.log(G + '✓' + X + ' Foundation has ' + Object.keys(foundation.baseScores).length + ' base scores for calibration');
}

console.log();
console.log(C + '═══════════════════════════════════════════════════════════════' + X);
if (errors === 0 && warnings === 0) {
    console.log(G + '✓ ALL CHECKS PASSED' + X);
    console.log(G + '  Safe to deploy' + X);
    process.exit(0);
} else {
    console.log(errors > 0 ? R + '✗ ' + errors + ' ERRORS' + X : '' + (warnings > 0 ? Y + '⚠ ' + warnings + ' WARNINGS' + X : ''));
    if (errors > 0) {
        console.log(R + '  DO NOT DEPLOY - Fix errors first' + X);
        process.exit(1);
    } else {
        console.log(Y + '  Review warnings before deploying' + X);
        process.exit(0);
    }
}