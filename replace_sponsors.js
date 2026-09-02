const fs = require('fs');
const cheerio = require('cheerio');
const files = ['index.html', 'articles.html', 'calendar.html', 'checkout.html', 'contact.html', 'legal.html', 'positions.html', 'store.html', 'tickets.html', 'accessories.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    
    // Find all divs that could be logos
    // The previous script found Apple, McDonald's, Spotify, Airbnb, Google, Logo
    // Let's replace the innerHTML of these specifically!
    const sponsorNames = ['Apple', 'McDonald\'s', 'Spotify', 'Airbnb', 'Google', 'Audi', 'Coinbase', 'CocaCola', 'Coca-Cola', 'Puma', 'Amazon', 'PayPal'];
    
    const ourSponsors = [
        'uvbi.png', 'garmscales.png', 'chilicode.png', 'flagnation.png', 'fma.png', 'rebels.png', 'tnt-league.png'
    ];
    let sIdx = 0;
    
    let replaced = 0;
    sponsorNames.forEach(name => {
        $(`[data-framer-name="${name}"]`).each((i, el) => {
            const imgSrc = `./assets/images/sponsors/${ourSponsors[sIdx % ourSponsors.length]}`;
            $(el).html(`<img src="${imgSrc}" alt="${name} replaced" style="height:44px;max-width:140px;object-fit:contain;filter:brightness(1) contrast(1.05);" />`);
            sIdx++;
            replaced++;
        });
    });
    
    if (replaced > 0) {
        fs.writeFileSync(file, $.html());
        console.log(`Replaced ${replaced} sponsors in ${file}`);
    }
}
