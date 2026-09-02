const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

const items = $('.ticker-item');
console.log('Ticker items:', items.length);
if (items.length > 0) {
    for (let i = 0; i < 5; i++) {
        const item = $(items[i]);
        console.log(`\n--- Ticker Item ${i} ---`);
        console.log(item.html().substring(0, 300));
    }
}

const allDivs = $('div[data-framer-name]');
const framerNames = new Set();
allDivs.each((i, el) => framerNames.add($(el).attr('data-framer-name')));
console.log('\nSome framer names:', Array.from(framerNames).slice(0, 20));
