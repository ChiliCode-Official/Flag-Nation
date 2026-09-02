const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const matches = html.match(/<img[^>]+alt="Club kraQen"[^>]*>/gi);
console.log(matches);
