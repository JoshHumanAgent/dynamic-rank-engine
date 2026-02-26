const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json', 'utf8'));
const shows = data.shows;

const weights = { char: 20, world: 15, cine: 15, spect: 10, conc: 15, drive: 15, resol: 10 };
const catKeys = ['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];

function getMultiplier(episodes) {
    if (episodes <= 10) return 0.96;
    if (episodes <= 20) return 0.95;
    if (episodes <= 30) return 0.97;
    if (episodes <= 40) return 1.00;
    if (episodes <= 50) return 1.02;
    if (episodes <= 60) return 1.03;
    if (episodes <= 75) return 1.04;
    if (episodes <= 100) return 1.05;
    return 1.06;
}

// Simulate initScoreSystem
shows.forEach(show => {
    if (typeof show.final === 'string') show.final = parseFloat(show.final);
});
shows.sort((a, b) => b.final - a.final);
shows.forEach((show, idx) => { show.rank = idx + 1; });

let issues = [];

// Simulate renderShows for each show
shows.slice(0, 100).forEach(show => {
    const fields = {
        'rank': show.rank,
        'title': show.title,
        'year': show.year,
        'episodes': show.episodes,
        'final': show.final,
        'final.toFixed': typeof show.final === 'number' ? show.final.toFixed(2) : 'NOT A NUMBER: ' + typeof show.final,
        'multiplier': getMultiplier(show.episodes),
        'multiplier.toFixed': getMultiplier(show.episodes).toFixed(2),
        'poster': show.poster,
        'backdrop': show.backdrop,
        'genres': show.genres,
    };

    catKeys.forEach(k => { fields[k] = show[k]; });

    Object.entries(fields).forEach(([name, val]) => {
        if (val === undefined) {
            issues.push(`[${show.title}] ${name} = undefined`);
        } else if (val === null) {
            issues.push(`[${show.title}] ${name} = null`);
        } else if (typeof val === 'number' && isNaN(val)) {
            issues.push(`[${show.title}] ${name} = NaN`);
        } else if (String(val) === 'undefined') {
            issues.push(`[${show.title}] ${name} renders as "undefined": ${val}`);
        }
    });

    // Simulate the template string expressions
    const rankStr = `#${show.rank}`;
    const yearStr = `${show.year}`;
    const epStr = `${show.episodes} ep`;
    const multStr = `×${getMultiplier(show.episodes).toFixed(2)}`;
    const scoreStr = `${show.final.toFixed ? show.final.toFixed(2) : '⚠️ NO TOFIXED'}`;

    [rankStr, yearStr, epStr, multStr, scoreStr].forEach(s => {
        if (s.includes('undefined') || s.includes('NaN')) {
            issues.push(`[${show.title}] template renders: "${s}"`);
        }
    });

    // Genre tags
    if (Array.isArray(show.genres)) {
        show.genres.forEach((g, i) => {
            if (g === undefined || g === null || String(g) === 'undefined') {
                issues.push(`[${show.title}] genre[${i}] = "${g}"`);
            }
        });
    }
});

console.log(`Simulated top 100 shows render`);
console.log(`Issues found: ${issues.length}`);
issues.forEach(i => console.log(i));
if (issues.length === 0) console.log('✅ No undefined values detected in card rendering');
