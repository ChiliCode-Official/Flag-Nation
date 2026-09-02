const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'flag nation original', 'purple-insurance-372174.framer.app');
const destDir = __dirname;
const htmlFiles = ['index.html', 'articles.html', 'calendar.html', 'checkout.html', 'contact.html', 'legal.html', 'positions.html', 'store.html', 'tickets.html', 'accessories.html'];

for (const file of htmlFiles) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Fix relative paths for framerusercontent
        content = content.replace(/\.\.\/framerusercontent\.com/g, './flag nation original/framerusercontent.com');
        
        // Also fix any other relative paths if needed, e.g., to local css/js if they exist
        // The original scrape might have `../` for other things, but framerusercontent is the main one.

        // We also want to replace the main logos with Flag Nation's logos
        // In the sponsor section (based on user's current index.html):
        // Kraquen original sponsors: Coinbase, Audi, CocaCola, etc.
        // User's sponsors: uvbi, garmscales, chilicode, flagnation, fma, rebels, tnt-league
        
        // This is a bit manual, but we can do a generic replace if we just replace the images:
        // Actually, to make it look exactly like the Kraquen template BUT with their logos, we can search for the Coinbase/Audi image URLs and replace them.

        fs.writeFileSync(destPath, content);
        console.log(`Restored and fixed paths in ${file}`);
    }
}
