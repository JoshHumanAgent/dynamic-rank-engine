/**
 * Backup Script for Dynamic Rank Engine
 * Creates timestamped backup of critical files
 * 
 * Usage: node scripts/backup.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupPath = path.join(BACKUP_DIR, `backup-${TIMESTAMP}`);
fs.mkdirSync(backupPath, { recursive: true });

// Files/directories to backup
const toBackup = [
  'data/shows/index.json',
  'data/shows',
  'data/discovery',
  'docs/shows'
];

let backedUp = 0;
let errors = [];

for (const item of toBackup) {
  const sourcePath = path.join(ROOT, item);
  const destPath = path.join(backupPath, item);
  
  try {
    if (!fs.existsSync(sourcePath)) {
      console.log(`[SKIP] ${item} - not found`);
      continue;
    }
    
    // Create destination directory
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Copy file or directory
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
    
    console.log(`[OK] ${item}`);
    backedUp++;
  } catch (error) {
    console.log(`[ERR] ${item}: ${error.message}`);
    errors.push({ item, error: error.message });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Create backup manifest
const manifest = {
  timestamp: TIMESTAMP,
  backedUp,
  errors,
  files: fs.readdirSync(backupPath, { recursive: true }).length
};

fs.writeFileSync(
  path.join(backupPath, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('\n---');
console.log(`Backup created: ${backupPath}`);
console.log(`Items backed up: ${backedUp}`);
console.log(`Errors: ${errors.length}`);

// Clean old backups (keep last 10)
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('backup-'))
  .sort()
  .reverse();

if (backups.length > 10) {
  const toDelete = backups.slice(10);
  for (const old of toDelete) {
    const oldPath = path.join(BACKUP_DIR, old);
    fs.rmSync(oldPath, { recursive: true });
    console.log(`Cleaned old backup: ${old}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);