const fs = require('fs');
const https = require('https');

function readJSON(p) { 
    let c = fs.readFileSync(p, 'utf8'); 
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1); 
    return JSON.parse(c); 
}
function writeJSON(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8'); }

// Shows with wrong TMDB IDs (from scan)
const mismatched = [
    { title: 'The Last Kingdom', slug: 'the-last-kingdom' },
    { title: 'Alias', slug: 'alias-s1-3' },
    { title: 'The Handmaid\'s Tale', slug: 'the-handmaids-tale' },
    { title: 'Evil', slug: 'evil' },
    { title: 'Arrested Development', slug: 'arrested-development-s1-3' },
    { title: 'Hell on Wheels', slug: 'hell-on-wheels' },
    { title: 'Longmire', slug: 'longmire' },
    { title: 'Shogun', slug: 'shogun-2024' },
    { title: 'Search Party', slug: 'search-party' },
    { title: 'Altered Carbon', slug: 'altered-carbon-s1' },
    { title: 'Tremé', slug: 'treme' },
    { title: 'Only Murders in the Building', slug: 'only-murders-in-the-building' },
    { title: 'Abbott Elementary', slug: 'abbott-elementary' },
    { title: 'I May Destroy You', slug: 'i-may-destroy-you' },
    { title: 'Leverage', slug: 'leverage' },
    { title: 'Veep', slug: 'veep' },
    { title: 'Doctor Who', slug: 'doctor-who-2005' },
    { title: 'Killjoys', slug: 'killjoys' },
    { title: 'Burn Notice', slug: 'burn-notice' },
    { title: 'Bordertown', slug: 'bordertown' },
    { title: 'Elementary', slug: 'elementary' },
    { title: 'Wallander', slug: 'wallander' },
    { title: 'John Adams', slug: 'john-adams' },
    { title: 'White Collar', slug: 'white-collar' },
    { title: 'Mindhunter', slug: 'mindhunter' },
    { title: 'The Originals', slug: 'the-originals' },
    { title: 'Eureka', slug: 'eureka' },
    { title: 'It\'s a Sin', slug: 'its-a-sin' },
    { title: 'The Night Of', slug: 'the-night-of' },
    { title: 'From', slug: 'from' },
    { title: 'Pose', slug: 'pose' },
    { title: 'Tabula Rasa', slug: 'tabula-rasa' },
    { title: 'The Marvelous Mrs. Maisel', slug: 'the-marvelous-mrs-maisel' },
    { title: 'Fortitude', slug: 'fortitude' },
    { title: 'Veronica Mars', slug: 'veronica-mars' },
    { title: 'Beef', slug: 'beef' },
    { title: 'Better Things', slug: 'better-things' },
    { title: 'In Treatment', slug: 'in-treatment' },
    { title: 'The Librarians', slug: 'the-librarians' },
    { title: 'Professor T', slug: 'professor-t' },
    { title: 'Carnivale', slug: 'carnivale' },
    { title: 'Cardinal', slug: 'cardinal' },
    { title: 'Skins', slug: 'skins-uk' },
    { title: 'Smallville', slug: 'smallville' },
    { title: 'The Bridge', slug: 'the-bridge-us' },
    { title: 'Narcos: Mexico', slug: 'narcos-mexico' },
    { title: 'River', slug: 'river' },
    { title: 'The Missing', slug: 'the-missing' },
    { title: 'The Stranger', slug: 'the-stranger' },
    { title: 'Industry', slug: 'industry' },
    { title: 'Shrinking', slug: 'shrinking' },
    { title: 'Physical', slug: 'physical' },
    { title: 'Torchwood', slug: 'torchwood' },
    { title: 'Little America', slug: 'little-america' },
    { title: 'The Bay', slug: 'the-bay' },
    { title: 'The Righteous Gemstones', slug: 'the-righteous-gemstones' },
    { title: 'Unbreakable Kimmy Schmidt', slug: 'unbreakable-kimmy-schmidt' },
    { title: 'City on a Hill', slug: 'city-on-a-hill' },
    { title: 'Watchmen', slug: 'watchmen-2019' },
    { title: 'Brassic', slug: 'brassic' },
    { title: 'Mythic Quest', slug: 'mythic-quest' },
    { title: 'The Night Agent', slug: 'the-night-agent' },
    { title: 'Looking', slug: 'looking' },
    { title: 'Rubicon', slug: 'rubicon' },
    { title: 'Defending Jacob', slug: 'defending-jacob' },
    { title: 'Truth Be Told', slug: 'truth-be-told' },
    { title: 'Annika', slug: 'annika' },
    { title: 'Safe', slug: 'safe' },
    { title: 'Your Honor', slug: 'your-honor' },
    { title: 'Crazyhead', slug: 'crazyhead' },
    { title: 'Gracepoint', slug: 'gracepoint' },
    { title: 'Dawson\'s Creek', slug: 'dawsons-creek' },
    { title: 'Peep Show', slug: 'peep-show' },
    { title: 'Party of Five', slug: 'party-of-five' },
    { title: 'Young Wallander', slug: 'young-wallander' },
    { title: 'One Tree Hill', slug: 'one-tree-hill' },
    { title: 'The Changeling', slug: 'the-changeling' },
    { title: 'Let the Right One In', slug: 'let-the-right-one-in' },
    { title: 'The Office', slug: 'the-office-uk' },
    { title: 'High Maintenance', slug: 'high-maintenance' },
    { title: 'Togetherness', slug: 'togetherness' },
    { title: 'Dear Edward', slug: 'dear-edward' },
    { title: 'Mr. Show', slug: 'mr-show' },
    { title: 'This Country', slug: 'this-country' },
    { title: 'Tell Me You Love Me', slug: 'tell-me-you-love-me' },
    { title: 'The Inbetweeners', slug: 'the-inbetweeners' },
    { title: 'Undeclared', slug: 'undeclared' }
];

const index = readJSON('data/shows/index.json');
const ranked = readJSON('data/core/ranked.json');

async function searchTMDB(title, year) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(title);
        let url = 'https://api.themoviedb.org/3/search/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&query=' + query;
        if (year) url += '&first_air_date_year=' + year;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results.results && results.results.length > 0) {
                        resolve(results.results[0]);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function fixAll() {
    console.log('=== FIXING TMDB IDs ===\n');
    let fixed = 0;
    
    for (let i = 0; i < mismatched.length; i++) {
        const m = mismatched[i];
        process.stdout.write('\r' + (i+1) + '/' + mismatched.length + ': ' + m.title.substring(0, 25).padEnd(25));
        
        await new Promise(r => setTimeout(r, 80));
        
        let result = await searchTMDB(m.title);
        
        // Try with year suffix if needed
        if (!result && m.slug.includes('-2019')) result = await searchTMDB(m.title, 2019);
        if (!result && m.slug.includes('-2024')) result = await searchTMDB(m.title, 2024);
        if (!result && m.slug.includes('-2005')) result = await searchTMDB(m.title, 2005);
        if (!result && m.slug.includes('-uk')) result = await searchTMDB(m.title + ' UK');
        if (!result && m.slug.includes('-us')) result = await searchTMDB(m.title + ' US');
        
        if (result) {
            // Update index
            const idxShow = index.shows.find(s => s.slug === m.slug);
            if (idxShow) {
                idxShow.tmdbId = result.id;
                if (result.poster_path) {
                    idxShow.poster = 'https://image.tmdb.org/t/p/w500' + result.poster_path;
                }
            }
            
            // Update ranked
            const rankedShow = ranked.shows.find(s => s.slug === m.slug);
            if (rankedShow) {
                rankedShow.tmdbId = result.id;
                if (result.poster_path) {
                    rankedShow.poster = 'https://image.tmdb.org/t/p/w500' + result.poster_path;
                }
            }
            
            fixed++;
        }
    }
    
    console.log('\n\nFixed ' + fixed + ' shows');
    
    writeJSON('data/shows/index.json', index);
    writeJSON('data/core/ranked.json', ranked);
    console.log('Files updated');
}

fixAll();