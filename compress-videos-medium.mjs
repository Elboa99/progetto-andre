import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputDir = path.join(process.cwd(), 'video_originali'); // <-- CAMBIA QUESTO PERCORSO
const outputDir = path.join(process.cwd(), 'goldenkey-site', 'assets', 'images');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Make sure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure the input dir exists (user needs to create it or point to it)
if (!fs.existsSync(inputDir)) {
    console.error(`Errore: la cartella '${inputDir}' non esiste.`);
    console.log(`Crea una cartella chiamata 'video_originali' in 'progetto andre', mettici dentro i 5 video mp4 pesanti e riavvia lo script.`);
    process.exit(1);
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.mp4'));

if (files.length === 0) {
    console.log("Nessun file .mp4 trovato nella cartella video_originali.");
    process.exit(0);
}

console.log(`🎬 Compressione Media Qualità di ${files.length} video in corso...`);
console.log(`   (Obiettivo: ~3-6MB per video, risoluzione 1920x1080)`);

let totalSaved = 0;

for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    // Rename output to hero-X.mp4 automatically based on index, or keep original name.
    // Assuming they are named hero-1.mp4, etc.
    const outputPath = path.join(outputDir, file);

    const originalSize = fs.statSync(inputPath).size / (1024 * 1024);

    try {
        // -crf 24: better quality than 30
        // scale=1920:-2: keeps 1080p width (if source is 4K, it downscales to 1080p, keeps aspect ratio)
        // preset slow: better compression ratio
        execFileSync(ffmpegPath, [
            '-y',
            '-i', inputPath,
            '-vcodec', 'libx264',
            '-crf', '24',
            '-preset', 'slow',
            '-profile:v', 'main',
            '-level', '4.0',
            '-vf', 'scale=1920:-2',
            '-pix_fmt', 'yuv420p',
            '-an', // remove audio if any
            '-movflags', '+faststart',
            outputPath
        ]);

        const newSize = fs.statSync(outputPath).size / (1024 * 1024);
        totalSaved += (originalSize - newSize);
        console.log(`  ${file} (${originalSize.toFixed(1)}MB) → ${newSize.toFixed(1)}MB ✓`);

    } catch (error) {
        console.error(`  Errore durante la compressione di ${file}:`, error.message);
    }
}

console.log(`\n✅ Finito! Qualità aumentata con successo.`);
