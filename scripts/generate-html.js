const fs = require('fs');

function readJSON(p) { 
    let c = fs.readFileSync(p, 'utf8'); 
    if(c.charCodeAt(0)===0xFEFF)c=c.substring(1); 
    return JSON.parse(c); 
}

function createWriteup(show) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${show.title} - TV Shows Ranked</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <article class="show-detail">
        <header class="show-header" style="background-image: url('${show.backdrop}')">
            <div class="show-header-overlay">
                <img src="${show.poster}" alt="${show.title}" class="show-poster">
                <div class="show-info">
                    <h1>${show.title}</h1>
                    <div class="show-meta">
                        <span class="year">${show.year}</span>
                        <span class="network">${show.network}</span>
                        <span class="episodes">${show.episodes} episodes</span>
                    </div>
                    <div class="show-score">
                        <span class="final-score">${show.final}</span>
                        <span class="rank">Rank #${show.rank}</span>
                    </div>
                </div>
            </div>
        </header>
        
        <section class="show-content">
            <div class="score-breakdown">
                <h2>Score Breakdown</h2>
                <div class="score-bars">
                    <div class="score-bar"><span class="label">Characters & Acting</span><span class="value" style="width: ${show.char * 10}%">${show.char}</span></div>
                    <div class="score-bar"><span class="label">World Building</span><span class="value" style="width: ${show.world * 10}%">${show.world}</span></div>
                    <div class="score-bar"><span class="label">Cinematography</span><span class="value" style="width: ${show.cine * 10}%">${show.cine}</span></div>
                    <div class="score-bar"><span class="label">Visual Spectacle</span><span class="value" style="width: ${show.spect * 10}%">${show.spect}</span></div>
                    <div class="score-bar"><span class="label">Conceptual Density</span><span class="value" style="width: ${show.conc * 10}%">${show.conc}</span></div>
                    <div class="score-bar"><span class="label">Narrative Drive</span><span class="value" style="width: ${show.drive * 10}%">${show.drive}</span></div>
                    <div class="score-bar"><span class="label">Resolution</span><span class="value" style="width: ${show.resol * 10}%">${show.resol}</span></div>
                </div>
            </div>
            
            <div class="show-review">
                <h2>Review</h2>
                <p class="review-placeholder">[Deep content coming soon]</p>
            </div>
        </section>
    </article>
</body>
</html>`;
}

// Get count from command line or default to 5
const count = parseInt(process.argv[2]) || 5;

const top100 = readJSON('data/core/01-current-index.json');
const htmlDir = 'data/shows/html';

if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir, { recursive: true });

// Check existing
const existing = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''));

// Generate writeups for shows missing them
let generated = 0;
top100.shows.forEach(show => {
    if (generated >= count) return;
    if (existing.includes(show.slug)) return;
    
    const html = createWriteup(show);
    fs.writeFileSync(htmlDir + '/' + show.slug + '.html', html);
    console.log('Created:', show.slug + '.html');
    generated++;
});

console.log('');
console.log('Generated', generated, 'HTML writeups');
console.log('Total existing:', existing.length + generated);