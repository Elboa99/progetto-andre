const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const inputDir = path.join('C:', 'Users', 'KennyLuigiBoateng', 'OneDrive - ITS Angelo Rizzoli', 'Desktop', 'video_originali');
const outputDir = path.join('C:', 'Users', 'KennyLuigiBoateng', 'OneDrive - ITS Angelo Rizzoli', 'Desktop', 'progetto andre', 'goldenkey-site', 'assets', 'videos');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Find ffmpeg
let ffmpegPath;
try {
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} catch (e) {
    ffmpegPath = 'ffmpeg'; // fallback to system ffmpeg
}

const videos = [
    { input: '1.mp4', outputDesk: 'hero-1.mp4', outputMob: 'hero-1-mobile.mp4' },
    { input: '2.MP4', outputDesk: 'hero-2.mp4', outputMob: 'hero-2-mobile.mp4' },
    { input: '3.MP4', outputDesk: 'hero-3.mp4', outputMob: 'hero-3-mobile.mp4' },
    { input: '4.mp4', outputDesk: 'hero-4.mp4', outputMob: 'hero-4-mobile.mp4' },
    { input: '5.MP4', outputDesk: 'hero-5.mp4', outputMob: 'hero-5-mobile.mp4' },
];

console.log('🎬 Preparazione Video Finali in corso...');
console.log('');

for (const v of videos) {
    const inputPath = path.join(inputDir, v.input);
    const deskPath = path.join(outputDir, v.outputDesk);
    const mobPath = path.join(outputDir, v.outputMob);

    if (!fs.existsSync(inputPath)) {
        console.log(`  ⚠️  ${v.input} non trovato, skip`);
        continue;
    }

    // 1. Copy original to desktop name
    console.log(`  Copiando originale per Desktop: ${v.outputDesk}...`);
    fs.copyFileSync(inputPath, deskPath);

    // 2. Compress for mobile
    console.log(`  Comprimendo per Mobile (CRF 18, 720p): ${v.outputMob}...`);
    try {
        execFileSync(ffmpegPath, [
            '-y',
            '-i', inputPath,
            '-vcodec', 'libx264',
            '-crf', '18', // Very high quality for mobile
            '-preset', 'slow',
            '-profile:v', 'high',
            '-level', '4.1',
            '-vf', 'scale=1080:-2', // Reduce resolution slightly for mobile without losing perceived quality on small screens but saving size
            '-pix_fmt', 'yuv420p',
            '-an',
            '-movflags', '+faststart',
            mobPath
        ], { stdio: 'pipe', timeout: 300000 });

        const mobMB = fs.statSync(mobPath).size / (1024 * 1024);
        console.log(`  ✅ ${v.outputMob}: ${mobMB.toFixed(1)}MB`);
    } catch (err) {
        console.error(`  ❌ Errore su ${v.input}:`, err.message?.substring(0, 200));
    }
}
console.log('✅ Tutto pronto!');
