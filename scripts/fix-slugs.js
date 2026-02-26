const fs = require('fs');
const path = require('path');

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1);
    return JSON.parse(c);
}

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
const data = readJSON(rankedPath);

console.log('=== FIXING SLUGS ===\n');

let fixed = 0;
data.shows.forEach(s => {
    if(s.slug && (s.slug.startsWith(' ') || s.slug.endsWith(' '))) {
        const oldSlug = s.slug;
        s.slug = s.slug.trim();
        console.log('Fixed: "' + oldSlug + '" -> "' + s.slug + '"');
        fixed++;
    }
});

if (fixed > 0) {
    fs.writeFileSync(rankedPath, JSON.stringify(data, null, 2));
    console.log('\nFixed ' + fixed + ' slugs');
} else {
    console.log('No slugs to fix');
}