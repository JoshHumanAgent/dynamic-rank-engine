// Full simulation of the app's initScoreSystem + renderShows
const fs = require('fs');
const raw = fs.readFileSync('C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json', 'utf8');
const data = JSON.parse(raw);
let shows = data.shows;

const weights = { char: 20, world: 15, cine: 15, spect: 10, conc: 15, drive: 15, resol: 10 };
const catKeys = ['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];
const baseScores = {};
const activeScores = {};

// Coerce string finals
shows.forEach(show => { if (typeof show.final === 'string') show.final = parseFloat(show.final); });

// initScoreSystem
shows.forEach(show => {
    baseScores[show.title] = {};
    activeScores[show.title] = {};
    catKeys.forEach(key => {
        baseScores[show.title][key] = show[key];
        activeScores[show.title][key] = show[key];
    });
    const baseWeighted = (
        (show.char * weights.char) + (show.world * weights.world) + (show.cine * weights.cine) +
        (show.spect * weights.spect) + (show.conc * weights.conc) + (show.drive * weights.drive) +
        (show.resol * weights.resol)
    ) / 100;
    baseScores[show.title].calculatedFinal = parseFloat(baseWeighted.toFixed(2));
    baseScores[show.title].final = show.final;
});
shows.sort((a, b) => b.final - a.final);
shows.forEach((show, idx) => { show.rank = idx + 1; });

// renderShows simulation - top 100
const minScore = 6.5;
let filtered = shows.filter(show => show.final >= minScore);
filtered = filtered.slice(0, 100);

let issues = [];
filtered.forEach(show => {
    catKeys.forEach(key => {
        const value = show[key]; // This is what the card uses
        const percentage = (value / 10) * 100;

        if (value === undefined) issues.push(`[${show.title}] card uses show.${key} = undefined`);
        if (isNaN(percentage)) issues.push(`[${show.title}] percentage for ${key} is NaN (value=${value})`);

        // Check active scores too
        const active = activeScores[show.title];
        if (!active) issues.push(`[${show.title}] activeScores entry missing`);
        else if (active[key] === undefined) issues.push(`[${show.title}] activeScores.${key} = undefined`);
    });

    // Template expressions
    if (isNaN(show.rank)) issues.push(`[${show.title}] rank is NaN`);
    if (show.rank === undefined) issues.push(`[${show.title}] rank is undefined`);
    if (!show.final || isNaN(show.final)) issues.push(`[${show.title}] final is invalid: ${show.final}`);
    if (!show.title) issues.push(`[${show.title}] title missing`);
    if (!show.year) issues.push(`[(${show.rank})] year missing`);
    if (!show.episodes && show.episodes !== 0) issues.push(`[${show.title}] episodes missing`);
});

console.log(`Top ${filtered.length} shows rendered`);
console.log(`Score range: ${filtered[0]?.final} to ${filtered[filtered.length-1]?.final}`);
console.log(`Issues: ${issues.length}`);
issues.forEach(i => console.log(i));
if (issues.length === 0) console.log('✅ Everything clean in full simulation');

// Show the top 10 by final score
console.log('\nTop 10 shows:');
filtered.slice(0, 10).forEach(s => console.log(`  #${s.rank} ${s.title} (${s.final})`));
