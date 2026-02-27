const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.join(__dirname, 'Contenuti Brand Sito', 'swisstransfer definitvo');
const destDir = path.join(__dirname, 'goldenkey-site', 'assets', 'images');
const galleryDir = path.join(destDir, 'gallery');

// 1. Delete old property photos from destDir
const filesToDel = fs.readdirSync(destDir).filter(f => f.startsWith('property-') || (f.startsWith('new-') && f.endsWith('.webp')));
filesToDel.forEach(f => {
    try { fs.unlinkSync(path.join(destDir, f)); } catch (e) { }
});

// 2. Clear out gallery dir
if (fs.existsSync(galleryDir)) {
    fs.readdirSync(galleryDir).forEach(f => {
        try { fs.unlinkSync(path.join(galleryDir, f)); } catch (e) { }
    });
} else {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// 3. Process new photos
const newPhotos = fs.readdirSync(sourceDir).filter(f => f.match(/\.(png|jpe?g)$/i));
newPhotos.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

console.log(`Processing ${newPhotos.length} photos...`);

async function processAll() {
    let count = 1;
    for (const file of newPhotos) {
        const inputPath = path.join(sourceDir, file);
        const outputPath = path.join(destDir, `property-${count}.webp`);

        console.log(`Converting ${file} to property-${count}.webp ...`);
        try {
            await sharp(inputPath)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`  -> Success!`);
            count++;
        } catch (e) {
            console.error(`  -> Failed:`, e.message);
        }
    }
    console.log('✅ All done!');
}

processAll();
