const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('index.html', 'utf8'));

const allDivs = $('div[data-framer-name]');
const framerNames = new Set();
allDivs.each((i, el) => framerNames.add($(el).attr('data-framer-name')));
console.log('All framer names:', Array.from(framerNames).join(', '));
