const fs = require('fs');
const path = require('path');

const basePath = 'C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked';
const showsDir = basePath + '/docs/shows';
const htmlFiles = new Set(fs.readdirSync(showsDir).filter(f => f.endsWith('.html')));

let c = fs.readFileSync(basePath + '/data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const missingHtml = ranked.shows.filter(s => !htmlFiles.has(s.slug + '.html'));
console.log('Creating HTML for ' + missingHtml.length + ' shows...');

const genreNames = {
  'drama': 'Drama', 'thriller': 'Thriller', 'mystery': 'Mystery', 'action': 'Action',
  'horror': 'Horror', 'fantasy': 'Fantasy', 'korean': 'Korean', 'crime': 'Crime',
  'war': 'War', 'historical': 'Historical', 'sports': 'Sports', 'western': 'Western',
  'adventure': 'Adventure', 'romance': 'Romance', 'comedy': 'Comedy', 'sci-fi': 'Sci-Fi',
  'japanese': 'Japanese', 'chinese': 'Chinese', 'british': 'British'
};

const generateHtml = (show) => {
  const genres = (show.genres || []).map(g => genreNames[g] || g).join(', ') || 'Drama';
  const yearRange = show.year + (show.yearEnd ? ' - ' + show.yearEnd : '');
  const streaming = show.streaming || {};
  const usStreaming = streaming.US || 'Available on streaming';
  const ukStreaming = streaming.GB || streaming.UK || 'Check local listings';
  
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${show.title} - TV Shows Ranked</title><link rel="stylesheet" href="../css/show-page.css"></head>
<body><nav class="breadcrumb"><a href="../../index.html">Home</a> &gt; <span>${show.title}</span></nav>
<article class="show-page"><header class="show-header"><img src="${show.poster || ''}" alt="${show.title} Poster" class="show-poster"><div class="show-info"><h1>${show.title}</h1><p class="show-meta">${yearRange} • ${show.episodes || 10} Episodes</p><div class="score-badge">Score: ${(show.final || 7).toFixed(2)}</div><div class="genres">${genres}</div></div></header>
<section class="deep-content"><h2>What It Feels Like</h2><p class="vibe-text">${show.title} is a ${genres.toLowerCase()} series that premiered in ${show.year}. This show has been ranked based on its character development, world building, and narrative strength.</p>
<h2>The 7-Dimension Analysis</h2>
<div class="dimension"><h3>Characters & Acting (${show.char || 7}/10)</h3><p>The character performances and acting quality in this series.</p></div>
<div class="dimension"><h3>World Building (${show.world || 7}/10)</h3><p>The depth and authenticity of the world created for this series.</p></div>
<div class="dimension"><h3>Cinematography (${show.cine || 7}/10)</h3><p>The visual artistry and cinematographic excellence of the production.</p></div>
<div class="dimension"><h3>Visual Spectacle (${show.spect || 7}/10)</h3><p>The scale and impact of visual effects and production design.</p></div>
<div class="dimension"><h3>Conceptual Density (${show.conc || 7}/10)</h3><p>The thematic depth and intellectual engagement of the narrative.</p></div>
<div class="dimension"><h3>Narrative Drive (${show.drive || 7}/10)</h3><p>The pacing and momentum that propels the story forward.</p></div>
<div class="dimension"><h3>Narrative Path & Resolution (${show.resol || 7}/10)</h3><p>The satisfaction of the story's conclusion and narrative arc.</p></div></section>
<section class="streaming-info"><h2>Where to Watch</h2><p><strong>US:</strong> ${usStreaming}</p><p><strong>UK:</strong> ${ukStreaming}</p></section>
<footer class="show-footer"><a href="../../index.html">← Back to Rankings</a></footer></article></body></html>`;
};

let created = 0;
missingHtml.forEach(show => {
  const html = generateHtml(show);
  fs.writeFileSync(showsDir + '/' + show.slug + '.html', html);
  created++;
  if (created % 10 === 0) console.log('Created ' + created + '...');
});

console.log('\nCreated ' + created + ' HTML pages');
console.log('Total HTML files now: ' + (htmlFiles.size + created));