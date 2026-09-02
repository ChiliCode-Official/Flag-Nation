const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

const allDivs = $('div[data-framer-name]');
const framerNames = new Set();
allDivs.each((i, el) => framerNames.add($(el).attr('data-framer-name')));

const logoNames = Array.from(framerNames).filter(n => /(sponsor|logo|audi|spotify|airbnb|google|amazon|puma|mcdonald|paypal|cocacola|coinbase|apple)/i.test(n));
console.log('Logo/Sponsor framer names:', logoNames);

// Let's find one of these and see what it contains
logoNames.forEach(name => {
    const el = $(`div[data-framer-name="${name}"]`).first();
    console.log(`\n--- HTML for ${name} ---`);
    console.log(el.html().substring(0, 150));
});
