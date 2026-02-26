const fs = require('fs');
const https = require('https');
const path = require('path');

const basePath = 'C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked';
const TMDB_API_KEY = 'ca9b21cb89de2d1debed1050f603d7ad';

let ranked = JSON.parse(fs.readFileSync(basePath + '/data/core/ranked.json', 'utf8').replace(/^\uFEFF/, ''));

// Get shows missing streaming (limit to 50 for this run)
const missingStreaming = ranked.shows
  .filter(s => (!s.streaming || Object.keys(s.streaming).length === 0) && s.tmdbId)
  .slice(0, 50);

console.log('Fetching streaming data for ' + missingStreaming.length + ' shows...');

const fetchStreaming = (tmdbId, title) => {
  return new Promise((resolve) => {
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.results || {};
          const streaming = {};
          
          // US streaming
          if (results.US && results.US.flatrate) {
            streaming.US = results.US.flatrate.map(p => p.provider_name).join(', ');
          } else if (results.US && results.US.free) {
            streaming.US = results.US.free.map(p => p.provider_name).join(', ') + ' (Free)';
          } else if (results.US) {
            streaming.US = 'Available on TMDB';
          }
          
          // UK streaming  
          if (results.GB && results.GB.flatrate) {
            streaming.GB = results.GB.flatrate.map(p => p.provider_name).join(', ');
          } else if (results.GB && results.GB.free) {
            streaming.GB = results.GB.free.map(p => p.provider_name).join(', ') + ' (Free)';
          } else if (results.GB) {
            streaming.GB = 'Available on TMDB';
          }
          
          resolve({ title, streaming });
        } catch(e) {
          resolve({ title, streaming: {} });
        }
      });
    }).on('error', () => resolve({ title, streaming: {} }));
  });
};

(async () => {
  let fetched = 0;
  for (const show of missingStreaming) {
    const result = await fetchStreaming(show.tmdbId, show.title);
    if (Object.keys(result.streaming).length > 0) {
      const s = ranked.shows.find(x => x.tmdbId === show.tmdbId);
      if (s) {
        s.streaming = result.streaming;
        console.log(`#${show.rank} ${show.title}: US=${result.streaming.US || 'N/A'}, GB=${result.streaming.GB || 'N/A'}`);
        fetched++;
      }
    }
    await new Promise(r => setTimeout(r, 250)); // Rate limit
  }
  
  fs.writeFileSync(basePath + '/data/core/ranked.json', JSON.stringify(ranked, null, 2));
  console.log('\nFetched streaming for ' + fetched + ' shows');
})();