const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

// Find the ticker section
const ticker = $('.sponsors-ticker-ul, [class*="ticker"]');
console.log('Ticker found:', ticker.length);

if (ticker.length > 0) {
    // Look at first few items
    const items = ticker.find('li');
    console.log('Ticker items:', items.length);
    if (items.length > 0) {
        console.log('Sample item html:', $(items[0]).html().substring(0, 500));
    }
}

// Check other sponsor areas (like the large 3 logos)
// Let's search for "Coinbase" or "Audi" SVGs or data-framer-names
const coinbase = $('[data-framer-name="Coinbase"], [data-framer-name*="coinbase" i]');
console.log('Coinbase section:', coinbase.length);

const svgs = $('svg');
console.log('Total SVGs:', svgs.length);
