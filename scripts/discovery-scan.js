#!/usr/bin/env node
/**
 * Discovery Scan - Find new dramas to add to the pool
 * Scans TMDB for:
 * 1. New releases (last 30 days)
 * 2. Popular dramas not in pool
 * 3. Upcoming releases to watch
 */

const fs = require('fs');
const https = require('https');

const TMDB_API_KEY = 'ca9b21cb89de2d1debed1050f603d7ad';

// Helper: Read JSON with BOM handling
function readJSON(path) {
    let content = fs.readFileSync(path, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);
    return JSON.parse(content);
}

// Helper: Write JSON with BOM
function writeJSON(path, data) {
    fs.writeFileSync(path, '\ufeff' + JSON.stringify(data, null, 2));
}

// Helper: TMDB API request
function tmdb(path) {
    return new Promise((resolve, reject) => {
        const url = 'https://api.themoviedb.org/3' + path + (path.includes('?') ? '&' : '?') + 'api_key=' + TMDB_API_KEY;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// Helper: Normalize title for comparison
function normalize(title) {
    return title.toLowerCase()
        .replace(/\s*\(s\d+[^\)]*\)/gi, '')
        .replace(/\s*s\d+(-\d+)?/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 12);
}

async function main() {
    console.log('=== DISCOVERY SCAN ===');
    console.log('Time:', new Date().toISOString());
    console.log('');
    
    // Load existing shows
    const top100 = readJSON('data/core/01-current-index.json');
    const overflow = readJSON('data/core/02-overflow-pool.json');
    const existing = new Set([...top100.shows, ...overflow.shows].map(s => normalize(s.title)));
    
    console.log('Existing pool:', existing.size, 'shows');
    console.log('');
    
    const candidates = [];
    const seen = new Set();
    
    // Scan 1: New releases (last 30 days)
    console.log('Scanning new releases (last 30 days)...');
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const newReleases = await tmdb(`/discover/tv?first_air_date.gte=${fromDate}&with_genres=18&sort_by=popularity.desc`);
    if (newReleases.results) {
        newReleases.results.forEach(show => {
            const norm = normalize(show.name);
            if (!existing.has(norm) && !seen.has(norm) && show.vote_count >= 5) {
                seen.add(norm);
                candidates.push({
                    title: show.name,
                    year: show.first_air_date?.substring(0, 4) || '????',
                    tmdbId: show.id,
                    rating: show.vote_average,
                    votes: show.vote_count,
                    source: 'new_release',
                    poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null
                });
            }
        });
    }
    console.log('Found', candidates.filter(c => c.source === 'new_release').length, 'new release candidates');
    
    // Scan 2: Popular dramas (high rated, not in pool)
    console.log('Scanning popular dramas...');
    const popular = await tmdb('/discover/tv?with_genres=18&sort_by=vote_average.desc&vote_count.gte=500&page=1');
    if (popular.results) {
        popular.results.forEach(show => {
            const norm = normalize(show.name);
            if (!existing.has(norm) && !seen.has(norm) && show.vote_average >= 7.5) {
                seen.add(norm);
                candidates.push({
                    title: show.name,
                    year: show.first_air_date?.substring(0, 4) || '????',
                    tmdbId: show.id,
                    rating: show.vote_average,
                    votes: show.vote_count,
                    source: 'popular',
                    poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null
                });
            }
        });
    }
    console.log('Found', candidates.filter(c => c.source === 'popular').length, 'popular candidates');
    
    // Scan 3: Upcoming dramas
    console.log('Scanning upcoming dramas...');
    const upcoming = await tmdb('/discover/tv?with_genres=18&sort_by=first_air_date.desc&first_air_date.gte=' + today.toISOString().split('T')[0]);
    if (upcoming.results) {
        upcoming.results.slice(0, 10).forEach(show => {
            const norm = normalize(show.name);
            if (!existing.has(norm) && !seen.has(norm)) {
                seen.add(norm);
                candidates.push({
                    title: show.name,
                    year: show.first_air_date?.substring(0, 4) || '????',
                    tmdbId: show.id,
                    rating: show.vote_average || 0,
                    votes: show.vote_count || 0,
                    source: 'upcoming',
                    poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null
                });
            }
        });
    }
    console.log('Found', candidates.filter(c => c.source === 'upcoming').length, 'upcoming candidates');
    
    // Save results
    const discoveryData = {
        last_scan: new Date().toISOString(),
        candidates: candidates.sort((a, b) => b.rating - a.rating),
        stats: {
            total_candidates: candidates.length,
            new_releases: candidates.filter(c => c.source === 'new_release').length,
            popular: candidates.filter(c => c.source === 'popular').length,
            upcoming: candidates.filter(c => c.source === 'upcoming').length
        }
    };
    
    writeJSON('data/discovery/candidates.json', discoveryData);
    
    console.log('');
    console.log('=== TOP CANDIDATES ===');
    candidates.slice(0, 10).forEach((c, i) => {
        console.log(`${i + 1}. ${c.title} (${c.year}) - ${c.rating}/10 [${c.source}]`);
    });
    console.log('');
    console.log('Total candidates:', candidates.length);
    console.log('Saved to: data/discovery/candidates.json');
}

main().catch(console.error);