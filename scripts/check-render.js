const https = require('https');

https.get('https://dynamicrankengine.com/', (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
        // Remove scripts to check actual DOM
        const noScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        
        // Check for actual show cards
        const cards = (noScripts.match(/show-module/g) || []).length;
        console.log('show-module references in DOM:', cards);
        
        // Check for any data-show-title outside scripts
        const titles = (noScripts.match(/data-show-title/g) || []).length;
        console.log('data-show-title in DOM:', titles);
        
        // Check what's in the rankings div
        const rankingsIdx = noScripts.indexOf('id="rankings"');
        if (rankingsIdx > 0) {
            console.log('');
            console.log('Rankings div found at:', rankingsIdx);
            console.log(noScripts.substring(rankingsIdx, rankingsIdx + 300));
        } else {
            console.log('');
            console.log('Rankings div NOT found in DOM');
        }
        
        // Check body size
        console.log('');
        console.log('Body (no scripts) size:', noScripts.length);
    });
}).on('error', e => console.log('ERROR:', e.message));
