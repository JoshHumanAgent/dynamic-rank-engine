#!/usr/bin/env node
/**
 * Parse .md files to extract 7-dimension scores and rebuild index.json
 * Recalculates final scores with current weights (25/15/5/5/15/15/20)
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = 'docs/shows';
const DATA_DIR = 'data/shows';

// Current weights (25/15/5/5/15/15/20)
const weights = {
  char: 25,
  world: 15,
  cine: 5,
  spect: 5,
  conc: 15,
  drive: 15,
  resol: 20
};

const catMap = {
  'Characters & Acting': 'char',
  'World Building': 'world',
  'Cinematography': 'cine',
  'Visual Spectacle': 'spect',
  'Conceptual Density': 'conc',
  'Narrative Drive': 'drive',
  'Narrative Resolution': 'resol',
  'Narrative Path & Resolution': 'resol'
};

function parseMdFile(content) {
  const scores = {};
  const lines = content.split('\n');

  // Look for scoring pattern: "### N. Category Name (X%) — Score: Y" OR "### N. Category Name (X%) - Score: Y"
  lines.forEach(line => {
    // Match either em-dash (—) or regular dash (-) before "Score:"
    const match = line.match(/^### \d+\.\s+(.+?)\s+\(\d+%\)\s+[—-]\s+Score:\s+(\d+(?:\.\d+)?)/);
    if (match) {
      const catName = match[1].trim();
      const score = parseFloat(match[2]);
      const key = catMap[catName];
      if (key) {
        scores[key] = score;
      }
    }
  });

  return scores;
}

function calculateFinal(scores) {
  const val = (
    (scores.char * weights.char) +
    (scores.world * weights.world) +
    (scores.cine * weights.cine) +
    (scores.spect * weights.spect) +
    (scores.conc * weights.conc) +
    (scores.drive * weights.drive) +
    (scores.resol * weights.resol)
  ) / 100;
  return parseFloat(val.toFixed(2));
}

async function main() {
  const mdFiles = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${mdFiles.length} .md files`);

  const shows = [];
  const errors = [];

  for (const mdFile of mdFiles) {
    const slug = mdFile.replace('.md', '');
    const mdPath = path.join(DOCS_DIR, mdFile);
    const jsonPath = path.join(DATA_DIR, `${slug}.json`);

    try {
      const mdContent = fs.readFileSync(mdPath, 'utf8');
      const scores = parseMdFile(mdContent);

      // Check if we got all 7 scores
      const missing = Object.keys(catMap).filter(k => !scores[catMap[k]] && catMap[k] !== 'resol'); // resol has two possible names
      if (!scores.resol) missing.push('Narrative Path & Resolution');

      if (Object.keys(scores).length < 7) {
        errors.push(`${slug}: Missing scores - have ${Object.keys(scores).join(', ')}`);
        continue;
      }

      // Load existing JSON for metadata
      let showData = {};
      if (fs.existsSync(jsonPath)) {
        showData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }

      // Get metadata from index.json if available
      const indexPath = path.join(DATA_DIR, 'index.json');
      let indexData = { shows: [] };
      if (fs.existsSync(indexPath)) {
        indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      }
      const existingShow = indexData.shows.find(s => s.slug === slug);

      const final = calculateFinal(scores);

      const show = {
        rank: existingShow?.rank || 0,
        slug,
        title: showData.title || existingShow?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        year: showData.year || existingShow?.year || 2000,
        month: showData.month || existingShow?.month || 1,
        genres: showData.genres || existingShow?.genres || ['drama'],
        final,
        tmdbId: showData.tmdbId || existingShow?.tmdbId || null,
        ...scores,
        episodes: showData.episodes || existingShow?.episodes || 10,
        poster: showData.streaming?.poster || existingShow?.poster || null,
        streaming: showData.streaming || existingShow?.streaming || { us: [], uk: [] }
      };

      shows.push(show);
      console.log(`${slug}: scores extracted, final = ${final}`);

    } catch (err) {
      errors.push(`${slug}: ${err.message}`);
    }
  }

  // Sort by final score descending
  shows.sort((a, b) => b.final - a.final);
  shows.forEach((s, i) => { s.rank = i + 1; });

  // Write new index.json
  const indexOutput = {
    description: "Index of all shows in Dynamic Rank Engine",
    generated: new Date().toISOString().split('T')[0],
    shows
  };

  fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(indexOutput, null, 4));
  console.log(`\n✅ Wrote ${shows.length} shows to data/shows/index.json`);

  if (errors.length > 0) {
    console.log(`\n⚠️ ${errors.length} errors:`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // Show top 10
  console.log('\n📊 New Top 10:');
  shows.slice(0, 10).forEach(s => {
    console.log(`  #${s.rank}: ${s.title} - ${s.final}`);
  });
}

main().catch(console.error);
