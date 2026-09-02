const fs = require('fs');
const cheerio = require('cheerio');
const files = ['index.html', 'articles.html', 'calendar.html', 'checkout.html', 'contact.html', 'legal.html', 'positions.html', 'store.html', 'tickets.html', 'accessories.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    let html = fs.readFileSync(file, 'utf8');
    
    // 1. Remove telemetry script
    html = html.replace(/<script[^>]*src=["']https:\/\/events\.framer\.com\/script\?v=2["'][^>]*><\/script>/gi, '');
    
    // 2. Remove framer editor init
    html = html.replace(/<script[^>]*src=["']https:\/\/framer\.com\/edit\/init\.mjs["'][^>]*><\/script>/gi, '');
    
    // Load into cheerio to manipulate DOM reliably
    const $ = cheerio.load(html);
    
    // 3. Remove watermark containers
    $('#__framer-badge-container').remove();
    $('.__framer-badge').remove();
    $('[href^="https://www.framer.com/"]').each((i, el) => {
        // Only remove if it looks like the made in framer badge
        const text = $(el).text() || '';
        if (text.toLowerCase().includes('made in framer')) {
            $(el).remove();
        }
    });

    // 4. Inject a CSS rule just in case the JS tries to rebuild the badge dynamically
    $('head').append('<style>#__framer-badge-container, .__framer-badge { display: none !important; }</style>');
    
    fs.writeFileSync(file, $.html());
    console.log(`Cleaned Framer connections and badge from ${file}`);
}
