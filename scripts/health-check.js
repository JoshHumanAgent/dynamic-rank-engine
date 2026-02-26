/**
 * Health Check Script for Dynamic Rank Engine (4-File System)
 * Run this to verify system integrity
 * 
 * Usage: node scripts/health-check.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CORE_DIR = path.join(ROOT, 'data', 'core');
const HTML_DIR = path.join(ROOT, 'data', 'shows', 'html');

const results = {
  timestamp: new Date().toISOString(),
  status: 'HEALTHY',
  checks: [],
  issues: [],
  warnings: [],
  stats: {}
};

function check(name, fn) {
  try {
    const result = fn();
    results.checks.push({ name, status: 'PASS', details: result });
    return true;
  } catch (error) {
    results.checks.push({ name, status: 'FAIL', error: error.message });
    results.issues.push(`${name}: ${error.message}`);
    results.status = 'UNHEALTHY';
    return false;
  }
}

function warn(name, message) {
  results.warnings.push(`${name}: ${message}`);
  results.checks.push({ name, status: 'WARN', details: message });
}

// Helper to read JSON with BOM handling
function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Remove BOM if present
  const clean = content.replace(/^\uFEFF/, '');
  return JSON.parse(clean);
}

// Check 1: Core files exist and are valid JSON
check('Core Files Structure', () => {
  const currentIndexPath = path.join(CORE_DIR, '01-current-index.json');
  const overflowPath = path.join(CORE_DIR, '02-overflow-pool.json');
  const queuePath = path.join(CORE_DIR, '03-ranking-queue.json');
  const directivePath = path.join(CORE_DIR, '04-DIRECTIVE.md');
  
  if (!fs.existsSync(currentIndexPath)) throw new Error('01-current-index.json not found');
  if (!fs.existsSync(overflowPath)) throw new Error('02-overflow-pool.json not found');
  if (!fs.existsSync(queuePath)) throw new Error('03-ranking-queue.json not found');
  if (!fs.existsSync(directivePath)) throw new Error('04-DIRECTIVE.md not found');
  
  return '4-file system intact';
});

// Check 2: Current Index (Top 100) valid
check('Current Index (Top 100)', () => {
  const indexPath = path.join(CORE_DIR, '01-current-index.json');
  const index = readJson(indexPath);
  if (!index.shows || !Array.isArray(index.shows)) throw new Error('Invalid current index structure');
  return `${index.shows.length} shows in Top 100`;
});

// Check 3: Overflow Pool valid
check('Overflow Pool', () => {
  const overflowPath = path.join(CORE_DIR, '02-overflow-pool.json');
  const overflow = readJson(overflowPath);
  if (!overflow.shows || !Array.isArray(overflow.shows)) throw new Error('Invalid overflow structure');
  return `${overflow.shows.length} shows in overflow pool`;
});

// Check 4: Ranking Queue valid
check('Ranking Queue', () => {
  const queuePath = path.join(CORE_DIR, '03-ranking-queue.json');
  const queue = readJson(queuePath);
  if (!queue.candidates || !Array.isArray(queue.candidates)) throw new Error('Invalid queue structure');
  return `${queue.candidates.length} shows in ranking queue`;
});

// Check 5: Calculate total pool size
check('Total Pool Size', () => {
  const currentIndex = readJson(path.join(CORE_DIR, '01-current-index.json'));
  const overflow = readJson(path.join(CORE_DIR, '02-overflow-pool.json'));
  const queue = readJson(path.join(CORE_DIR, '03-ranking-queue.json'));
  
  const totalRanked = currentIndex.shows.length + overflow.shows.length;
  const inQueue = queue.candidates.length;
  
  results.stats = {
    top100: currentIndex.shows.length,
    overflow: overflow.shows.length,
    totalRanked: totalRanked,
    inQueue: inQueue,
    target: 300
  };
  
  if (totalRanked < 200) warn('Pool Size', `Only ${totalRanked} ranked, target is 300+`);
  
  return `${totalRanked} ranked, ${inQueue} in queue (Target: 300+)`;
});

// Check 6: All Top 100 have HTML files
check('HTML Coverage (Top 100)', () => {
  const currentIndex = readJson(path.join(CORE_DIR, '01-current-index.json'));
  const slugs = currentIndex.shows.map(s => s.slug);
  const missing = [];
  
  for (const slug of slugs) {
    const htmlPath = path.join(HTML_DIR, `${slug}.html`);
    if (!fs.existsSync(htmlPath)) {
      missing.push(slug);
    }
  }
  
  if (missing.length > 0) {
    warn('Missing HTML', `${missing.length} shows in Top 100 missing HTML: ${missing.slice(0, 5).join(', ')}...`);
  }
  
  return `${slugs.length - missing.length}/${slugs.length} Top 100 have HTML`;
});

// Check 7: Git status
check('Git Status', () => {
  const gitPath = path.join(ROOT, '.git');
  if (!fs.existsSync(gitPath)) throw new Error('Not a git repository');
  return 'Git repository intact';
});

// Summary
results.summary = {
  totalChecks: results.checks.length,
  passed: results.checks.filter(c => c.status === 'PASS').length,
  warnings: results.warnings.length,
  failed: results.checks.filter(c => c.status === 'FAIL').length
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.status === 'HEALTHY' ? 0 : 1);
