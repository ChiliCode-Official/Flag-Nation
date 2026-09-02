const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const $ = require('cheerio').load(html);

// Find elements with classes that might have the SVGs
// The output of `find_sponsors.js` said the svgs had `framer-ppq9c framer-xa5ko2`.
// Wait, the SVG was a background image or nested? Let's check innerHTML of the parent of Apple
const apple = $('[data-framer-name="Apple"]').parent();
console.log("Parent of Apple:\n", apple.html()?.substring(0, 500));

// What about other logos?
const allLogos = $('[data-framer-name="Apple"], [data-framer-name="Spotify"], [data-framer-name="Airbnb"], [data-framer-name="Google"], [data-framer-name="McDonald\'s"]');
console.log(`Found ${allLogos.length} logos.`);

allLogos.each((i, el) => {
    console.log($(el).attr('data-framer-name'), $(el).parent().html().substring(0, 200));
});
