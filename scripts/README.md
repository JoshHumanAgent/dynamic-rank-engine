# Scripts Folder
*Batch processing tools for tvshowsranked.*

## Files

| File | Purpose |
|------|---------|
| `batch-narrative*.js` | Generate narrative descriptions for shows |
| `batch-update*.js` | Update show data in batches |
| `check-needs-update.js` | Check which shows need data updates |
| `check-top20.js` | Validate top 20 rankings |
| `batches.json` | Batch configuration |
| `needs-update.json` | Shows flagged for update |

## Usage

### Check what needs updating
```bash
node check-needs-update.js
```

### Run batch narrative generation
```bash
node batch-narrative.js
```

### Validate top 20
```bash
node check-top20.js
```

---
*These are workhorse scripts. Let them run while you do something more interesting.*
