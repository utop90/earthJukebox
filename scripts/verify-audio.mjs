import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/', import.meta.url);
const { items } = JSON.parse(await readFile(new URL('media-sources.json', root)));
for (const item of items) {
 const path = fileURLToPath(new URL(item.path, root));
 const probe = spawnSync('ffprobe', ['-v','error','-show_streams','-of','json',path], { windowsHide:true });
 if(probe.status !== 0) throw Error(probe.stderr.toString());
 const { streams } = JSON.parse(probe.stdout);
 const audio = streams.find(s=>s.codec_type==='audio');
 const video = streams.find(s=>s.codec_type==='video');
 if(!audio || !video || Math.abs(Number(audio.duration)-Number(video.duration))>.3) throw Error('Audio duration mismatch: '+item.path);
 const result = spawnSync('ffmpeg',['-hide_banner','-i',path,'-map','0:a:0','-af','volumedetect,silencedetect=noise=-50dB:d=0.5','-f','null','-'],{ windowsHide:true,maxBuffer:8*1024*1024 });
 const log = result.stderr.toString();
 const mean = Number(log.match(/mean_volume: ([-\d.]+)/)?.[1]);
 if(result.status!==0 || !Number.isFinite(mean) || mean < -35 || log.includes('silence_start:')) throw Error('Audio check failed: '+item.path+'\n'+log);
 console.log(`${item.path}: ${mean} dB, full duration, no silent gaps > 0.5s`);
}
