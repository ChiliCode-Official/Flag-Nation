const fs = require('fs');
const cheerio = require('cheerio');
const files = ['index.html', 'articles.html', 'calendar.html', 'checkout.html', 'contact.html', 'legal.html', 'positions.html', 'store.html', 'tickets.html', 'accessories.html'];

const sponsorNames = ['Apple', 'McDonald\'s', 'Spotify', 'Airbnb', 'Google', 'Audi', 'Coinbase', 'CocaCola', 'Coca-Cola', 'Puma', 'Amazon', 'PayPal', 'Nike', 'Windows', 'Target', 'Adidas', 'Pepsi', 'Red Bull', 'Logo'];

const ourSponsors = [
    'uvbi.png', 'garmscales.png', 'chilicode.png', 'flagnation.png', 'fma.png', 'rebels.png', 'tnt-league.png'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    let sIdx = 0;
    
    let replaced = 0;
    sponsorNames.forEach(name => {
        $(`[data-framer-name="${name}"]`).each((i, el) => {
            // Check if it's the main header Logo Wrapper. Don't replace "Logo Wrapper". The name is exactly "Logo" or exact match
            if ($(el).attr('data-framer-name') !== name) return;
            // Also skip if it's the main header logo (usually wrapped in Link or Nav). Let's see if we should skip Logo.
            if (name === 'Logo' && $(el).parents('header, nav, [data-framer-name="Nav"]').length > 0) return;

            const imgSrc = `./assets/images/sponsors/${ourSponsors[sIdx % ourSponsors.length]}`;
            $(el).html(`<img src="${imgSrc}" alt="${name}" style="height:44px;max-width:140px;object-fit:contain;filter:brightness(1) contrast(1.05);" />`);
            sIdx++;
            replaced++;
        });
    });
    
    if (replaced > 0) {
        fs.writeFileSync(file, $.html());
        console.log(`Replaced ${replaced} sponsors in ${file}`);
    }
}
