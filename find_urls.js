const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const urls = html.match(/https?:\/\/[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s"']*)?/g) || [];
const uniqueUrls = [...new Set(urls)].filter(u => !u.includes('w3.org'));
console.log(uniqueUrls);
