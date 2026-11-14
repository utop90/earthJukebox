const scale = [48, 50, 52, 55, 57, 60, 62, 64];
const width = 64;
const height = 32;
const noteLength = 0.16;

export async function playFrameSound(url: string, audio: AudioContext, signal: AbortSignal, onStart: () => void) {
  signal.throwIfAborted();
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const pixels = canvas.getContext('2d', { willReadFrequently: true });
  if (!pixels) throw new Error('Canvas unavailable');

  const release = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  };

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener('loadeddata', () => resolve(), { once: true, signal });
      video.addEventListener('error', () => reject(video.error), { once: true, signal });
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      video.src = url;
    });

    const sampleCount = 4;
    onStart();
    for (let frame = 0; frame < sampleCount; frame++) {
      signal.throwIfAborted();
      if (frame > 0) {
        const time = Math.min(frame * 1.25, video.duration * frame / sampleCount);
        if (Number.isFinite(time) && time > video.currentTime) {
          await new Promise<void>((resolve, reject) => {
            video.addEventListener('seeked', () => resolve(), { once: true, signal });
            video.addEventListener('error', () => reject(video.error), { once: true, signal });
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
            video.currentTime = time;
          });
        }
      }
      pixels.drawImage(video, video.videoWidth * 0.15, video.videoHeight * 0.15,
        video.videoWidth * 0.7, video.videoHeight * 0.7, 0, 0, width, height);
      const rgba = pixels.getImageData(0, 0, width, height).data;
      const start = audio.currentTime + 0.04;
      for (let column = 0; column < 8; column++) {
        let bright = 0;
        for (let y = 0; y < height; y++) {
          for (let x = column * 8; x < (column + 1) * 8; x++) {
            const i = (y * width + x) * 4;
            if (rgba[i] * 0.2126 + rgba[i + 1] * 0.7152 + rgba[i + 2] * 0.0722 >= 128) bright++;
          }
        }
        const midi = scale[Math.round(7 * bright / (8 * height))];
        const onset = start + column * noteLength;
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        envelope.gain.setValueAtTime(0.001, onset);
        envelope.gain.linearRampToValueAtTime(0.12, onset + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.001, onset + noteLength);
        oscillator.connect(envelope).connect(audio.destination);
        oscillator.start(onset);
        oscillator.stop(onset + noteLength);
      }
      await new Promise<void>(resolve => {
        const timer = window.setTimeout(() => {
          signal.removeEventListener('abort', cancel);
          resolve();
        }, (8 * noteLength + 0.04) * 1000);
        function cancel() {
          clearTimeout(timer);
          resolve();
        }
        signal.addEventListener('abort', cancel, { once: true });
      });
    }
  } finally {
    release();
  }
}
