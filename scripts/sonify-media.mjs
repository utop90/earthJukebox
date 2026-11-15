// Bake image-derived sonification into each MP4; video streams are copied unchanged.
import { readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('media-sources.json', root), 'utf8'));
await mkdir(new URL('media/audio/', root), { recursive: true });
function run(command, args) {
  const result = spawnSync(command, args, { windowsHide: true, maxBuffer: 128 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr.toString());
  return result.stdout;
}
const scale = [60, 62, 64, 67, 69, 72, 74, 76];
const linear = Array.from({ length: 256 }, (_, i) => (i / 255) ** 2.2);
for (const item of manifest.items) {
  const path = fileURLToPath(new URL(item.path, root));
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_format', '-of', 'json', path]));
  const duration = Number(probe.format.duration);
  if (!(duration > 0)) throw new Error(`Invalid duration: ${path}`);
  const frames = run('ffmpeg', ['-v', 'error', '-i', path, '-an', '-vf', 'crop=iw*0.7:ih*0.7,scale=32:18,fps=4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']);
  const frameSize = 32 * 18 * 3;
  const count = Math.floor(frames.length / frameSize);
  if (!count) throw new Error(`No frames: ${path}`);
  const rate = 22050;
  const samples = Math.ceil(duration * rate);
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
  for (let n = 0; n < Math.ceil(duration * 4); n++) {
    const offset = Math.min(n, count - 1) * frameSize;
    let brightness = 0;
    const column = n % 8;
    for (let y = 0; y < 18; y++) for (let x = column * 4; x < column * 4 + 4; x++) {
      const i = offset + (y * 32 + x) * 3;
      brightness += .2126 * linear[frames[i]] + .7152 * linear[frames[i + 1]] + .0722 * linear[frames[i + 2]];
    }
    const frequency = 440 * 2 ** ((scale[Math.min(7, Math.round(brightness / 72 * 7))] - 69) / 12);
    const start = Math.round(n * rate / 4);
    for (let j = 0; j < rate / 4 && start + j < samples; j++) {
      const t = j / rate;
      const envelope = Math.min(1, t / .015) * Math.exp(-t * 8) * Math.min(1, (.25 - t) / .02);
      const phase = 2 * Math.PI * frequency * t;
      const value = .42 * envelope * (Math.sin(phase) + .25 * Math.sin(2 * phase)) / 1.25;
      wav.writeInt16LE(Math.round(value * 32767), 44 + (start + j) * 2);
    }
  }
  const wavePath = path + '.wav';
  const outputPath = 'media/audio/' + item.path.split('/').pop();
  const destination = fileURLToPath(new URL(outputPath, root));
  const output = destination + '.tmp.mp4';
  try {
    await writeFile(wavePath, wav);
    run('ffmpeg', ['-v', 'error', '-y', '-i', path, '-i', wavePath, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', output]);
    const check = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', output]));
    if (!check.streams.some(s => s.codec_type === 'audio' && Number(s.duration) >= duration - .3)) throw new Error(`Missing audio: ${path}`);
    await rename(output, destination);
    item.path = outputPath;
    console.log(`Audio integrated: ${item.path}`);
  } finally {
    await rm(wavePath, { force: true });
    await rm(output, { force: true });
  }
}
await writeFile(new URL('media-sources.json', root), JSON.stringify(manifest, null, 2) + '\n');
