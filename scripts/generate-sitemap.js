const fs = require('fs');
const path = require('path');

// Read shows data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/shows/index.json'), 'utf8'));
const shows = data.shows;

// Generate sitemap XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dynamicrankengine.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Add each show page
shows.forEach(show => {
  xml += `  <url>
    <loc>https://dynamicrankengine.com/shows/${show.slug}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

xml += '</urlset>';

// Write sitemap
fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), xml);
console.log(`Generated sitemap with ${shows.length + 1} URLs`);