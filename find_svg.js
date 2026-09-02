const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const matches = html.match(/<svg[^>]*>.*?<\/svg>/gi);
if (matches) {
    console.log(`Found ${matches.length} SVGs. Logging first 3:`);
    matches.slice(0, 3).forEach((svg, i) => console.log(`\n--- SVG ${i+1} ---\n${svg.substring(0, 200)}...`));
} else {
    console.log("No SVGs found.");
}
