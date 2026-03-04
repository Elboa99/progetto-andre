import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, 'goldenkey-site', 'assets', 'images', 'swisstransfer2');

const files = [
    'Foto copertina  senza logo.png',
    'hf_20260131_150046_16da234d-05cc-4dd7-812d-38ebbe0f3840.png',
    'hf_20260131_234511_0c89e6b6-3a07-4d24-84e2-aabe2723d2f6.png',
    'hf_20260131_235227_54285fb9-a148-4e34-aadd-c23d40592f21.png',
];

const outputNames = [
    'hero-prop-1.webp',
    'hero-prop-2.webp',
    'hero-prop-3.webp',
    'hero-prop-4.webp',
];

for (let i = 0; i < files.length; i++) {
    const input = path.join(base, files[i]);
    const output = path.join(base, outputNames[i]);

    const origSize = fs.statSync(input).size;
    console.log(`Converting: ${files[i]} (${(origSize / 1024 / 1024).toFixed(1)} MB)`);

    await sharp(input)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(output);

    const newSize = fs.statSync(output).size;
    console.log(`  → ${outputNames[i]} (${(newSize / 1024).toFixed(0)} KB) — ${((1 - newSize / origSize) * 100).toFixed(0)}% smaller`);
}

console.log('\nDone!');
