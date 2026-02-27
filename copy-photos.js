const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, 'Contenuti Brand Sito', 'swisstransfer definitvo');
const destDir = path.join(__dirname, 'goldenkey-site', 'assets', 'images');

const newPhotos = fs.readdirSync(sourceDir).filter(f => f.match(/\.(png|jpe?g)$/i));
newPhotos.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

console.log(`Processing ${newPhotos.length} photos...`);

// Let's copy them first. If we can't compress them easily, copying is better than failing.
let count = 1;
for (const file of newPhotos) {
    const inputPath = path.join(sourceDir, file);
    // Since PNGs are huge (15MB), let's try a native Windows tool or install sharp locally if we must.
    // For now, let's copy them exactly to avoid losing quality/failing.
    const ext = path.extname(file).toLowerCase();
    const outputPath = path.join(destDir, `property-${count}${ext}`);

    fs.copyFileSync(inputPath, outputPath);
    console.log(`Copied ${file} -> property-${count}${ext}`);
    count++;
}
console.log('✅ Done!');
