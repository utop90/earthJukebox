// Rebuild same-origin NASA copies used for Canvas/Web Audio sonification.
// Requires ffmpeg on PATH. Original sources and credits stay in the manifest.
import { readFile, mkdir, mkdtemp, stat, rm, rename } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const { items } = JSON.parse(await readFile(join(root, 'public/media-sources.json'), 'utf8'));
const scratch = await mkdtemp(join(tmpdir(), 'earth-media-'));
await mkdir(join(root, 'public/media'), { recursive: true });
let failed = false;

function convert(input, output) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input,
      '-an', '-vf', 'scale=w=min(960\\,iw):h=-2', '-r', '30', '-c:v', 'libx264',
      '-preset', 'fast', '-crf', '27', '-threads', '2', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', output], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let message = '';
    child.stderr.on('data', data => { message += data; });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(message)));
  });
}

try {
  const queue = [...items];
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      const output = join(root, 'public', item.path);
      const input = join(scratch, basename(item.path));
      try {
        if ((await stat(output).catch(() => null))?.size > 0) continue;
        const response = await fetch(item.source, { signal: AbortSignal.timeout(600000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await pipeline(Readable.fromWeb(response.body), createWriteStream(input));
        const temporaryOutput = output.replace(/\.mp4$/, '.tmp.mp4');
        await convert(input, temporaryOutput);
        await rename(temporaryOutput, output);
        console.log(`Prepared ${item.path}`);
      } catch (error) {
        failed = true;
        console.error(`${item.source}: ${error.message}`);
      } finally {
        await rm(input, { force: true });
      }
    }
  }));
} finally {
  await rm(scratch, { recursive: true, force: true });
}
if (failed) process.exitCode = 1;
