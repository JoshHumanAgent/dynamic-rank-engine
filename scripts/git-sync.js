/**
 * Git Sync Script for Dynamic Rank Engine
 * Commits and pushes changes with auto-generated messages
 * 
 * Usage: node scripts/git-sync.js [message]
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { 
      cwd: ROOT, 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.allowFail) throw error;
    return null;
  }
}

function getTimestamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// Check if there are changes
const status = run('git status --porcelain', { silent: true });
if (!status || status.trim() === '') {
  console.log('No changes to commit.');
  process.exit(0);
}

// Generate commit message
const argMessage = process.argv[2];
const changes = status.trim().split('\n').length;
const files = status.trim().split('\n').map(line => line.slice(3).trim());

// Categorize changes
const added = files.filter(f => status.includes(`?? ${f}`)).length;
const modified = changes - added;

let message = argMessage;
if (!message) {
  const parts = [];
  if (modified > 0) parts.push(`${modified} modified`);
  if (added > 0) parts.push(`${added} added`);
  message = `Auto-commit: ${parts.join(', ')} [${getTimestamp()}]`;
}

console.log(`\n📝 Committing ${changes} changes...`);
console.log(`Message: ${message}\n`);

// Add all changes
run('git add -A');

// Commit
run(`git commit -m "${message}"`);

// Push
console.log('\n🚀 Pushing to origin...');
try {
  run('git push origin master');
  console.log('\n✅ Sync complete!');
} catch (error) {
  console.log('⚠️ Push failed - will retry later');
  console.log(`Error: ${error.message}`);
  process.exit(1);
}