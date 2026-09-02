const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const imgs = html.match(/<img[^>]*>/gi) || [];
const alts = imgs.map(img => {
    const m = img.match(/alt="([^"]*)"/);
    return m ? m[1] : '';
}).filter(Boolean);
console.log([...new Set(alts)]);
