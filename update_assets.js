const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'articles.html', 'calendar.html', 'checkout.html', 'contact.html', 'legal.html', 'positions.html', 'store.html', 'tickets.html', 'accessories.html'];

for (const file of htmlFiles) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Replace Kraquen logo with Flag Nation logo
        // Original: ./flag nation original/framerusercontent.com/images/YSkIHfxrJZRfPaLSPn2Xs8lMtE6bbd.png
        // New: ./assets/images/flagnation-logo.png
        content = content.replace(/\.\/flag nation original\/framerusercontent\.com\/images\/YSkIHfxrJZRfPaLSPn2Xs8lMtE[^\.]*\.png(\?[^"]*)?/g, './assets/images/flagnation-logo.png');
        
        // Replace "Club kraQen" with "Flag Nation"
        content = content.replace(/Club kraQen/g, 'Flag Nation');
        content = content.replace(/Kraqen/g, 'Flag Nation');
        content = content.replace(/kraQen/g, 'Flag Nation');
        
        // Replace title Kraqen -> Flag Nation
        content = content.replace(/<title>[^<]*Kraqen[^<]*<\/title>/gi, '<title>Flag Nation | Liga de Tocho Flag Football Querétaro</title>');

        fs.writeFileSync(file, content);
        console.log(`Updated assets in ${file}`);
    }
}
