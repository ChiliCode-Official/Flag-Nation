const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const imgs = html.match(/<img[^>]*>/gi) || [];
const sponsors = imgs.filter(img => /alt="(Audi|Spotify|Airbnb|Google|Amazon|Puma|McDonald's|PayPal|Coca-Cola)"/i.test(img));
console.log(`Found ${sponsors.length} sponsor images.`);
if (sponsors.length > 0) console.log(sponsors[0]);
