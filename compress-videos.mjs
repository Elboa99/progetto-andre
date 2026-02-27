import { execFileSync } from 'child_process';
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

const videoDir = resolve('goldenkey-site/assets/videos');
const files = readdirSync(videoDir).filter(f => f.endsWith('.mp4') && !f.startsWith('compressed-')).sort();

console.log(`\n🎬 Compressing ${files.length} hero videos...`);

for (const file of files) {
    const src = join(videoDir, file);
    const tmp = join(videoDir, `compressed-${file}`);
    const sizeBefore = (statSync(src).size / 1024 / 1024).toFixed(1);

    process.stdout.write(`  ${file} (${sizeBefore}MB) → `);

    try {
        // scale with ceil to ensure even width/height (libx264 requirement)
        execFileSync(ffmpegPath, [
            '-i', src,
            '-vf', 'scale=1280:-2',
            '-c:v', 'libx264',
            '-crf', '30',
            '-preset', 'slow',
            '-an',
            '-movflags', '+faststart',
            '-y', tmp
        ], { stdio: 'pipe' });

        unlinkSync(src);
        renameSync(tmp, src);

        const sizeAfter = (statSync(src).size / 1024 / 1024).toFixed(1);
        console.log(`${sizeAfter}MB ✓`);
    } catch (err) {
        console.log(`✗ ${err.stderr?.toString().split('\n').slice(-5).join(' | ') || err.message}`);
        try { unlinkSync(tmp); } catch { }
    }
}

console.log('\n✅ Done!');
const totalSize = files.reduce((s, f) => { try { return s + statSync(join(videoDir, f)).size; } catch { return s; } }, 0);
console.log(`   Total: ${(totalSize / 1024 / 1024).toFixed(1)}MB\n`);
