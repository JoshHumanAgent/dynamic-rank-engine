const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json', 'utf8'));
const shows = data.shows;
const catKeys = ['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];

let issues = [];

shows.forEach((show, i) => {
    const t = show.title;

    // Check all cat scores
    catKeys.forEach(key => {
        const v = show[key];
        if (v === undefined || v === null) issues.push(`[${t}] ${key} = undefined/null`);
        else if (isNaN(parseFloat(v))) issues.push(`[${t}] ${key} = NaN (value: ${v})`);
        else if (typeof v === 'string') issues.push(`[${t}] ${key} is STRING: "${v}"`);
    });

    // Check final
    if (typeof show.final === 'string') issues.push(`[${t}] final is STRING: "${show.final}"`);
    if (isNaN(parseFloat(show.final))) issues.push(`[${t}] final is NaN`);

    // Check genres array contents
    if (Array.isArray(show.genres)) {
        show.genres.forEach((g, gi) => {
            if (g === undefined || g === null || typeof g !== 'string') {
                issues.push(`[${t}] genres[${gi}] = ${g}`);
            }
        });
    } else {
        issues.push(`[${t}] genres is not an array: ${typeof show.genres}`);
    }

    // Check episodes
    if (show.episodes === undefined || show.episodes === null) issues.push(`[${t}] episodes missing`);
    if (isNaN(show.episodes)) issues.push(`[${t}] episodes is NaN: ${show.episodes}`);

    // Check year/month
    if (!show.year) issues.push(`[${t}] year missing`);
    if (!show.month) issues.push(`[${t}] month missing`);

    // Check backdrop is undefined (will show "undefined" if not handled)
    if (show.backdrop === undefined) issues.push(`[${t}] backdrop is undefined (should be null or URL)`);
});

console.log(`\nTotal shows: ${shows.length}`);
console.log(`Issues found: ${issues.length}\n`);
issues.forEach(i => console.log(i));
