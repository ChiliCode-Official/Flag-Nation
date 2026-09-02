const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/.{0,100}Made in Framer.{0,100}/g);
console.log(match);
