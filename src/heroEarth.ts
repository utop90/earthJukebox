type Point = [number, number, number];
const radians = Math.PI / 180;
const tilt = 17 * radians;
const sinTilt = Math.sin(tilt);
const cosTilt = Math.cos(tilt);

export async function loadLand(signal: AbortSignal): Promise<Point[][]> {
  const response = await fetch(import.meta.env.BASE_URL + 'world-outline.svg', { signal });
  if (!response.ok) throw new Error('World outline unavailable');
  const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  const path = document.querySelector('path')?.getAttribute('d') ?? '';
  return path.split('M').filter(Boolean).map(ring => ring.split('L').map(pair => {
    const [x, y] = pair.trim().split(/\s+/).map(Number);
    const lon = (x - 180) * radians;
    const lat = (90 - y) * radians;
    return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)] as Point;
  }));
}

export function landPath(land: Point[][], longitude: number): string {
  const sin = Math.sin(longitude * radians);
  const cos = Math.cos(longitude * radians);
  const project = ([x, y, z]: Point): Point => {
    const depth = x * sin + z * cos;
    return [x * cos - z * sin, depth * sinTilt - y * cosTilt, depth * cosTilt + y * sinTilt];
  };
  const position = ([x, y]: Point) => `${(310 + 204 * x).toFixed(1)} ${(278 + 204 * y).toFixed(1)}`;
  const horizon = (a: Point, b: Point): Point => {
    const t = a[2] / (a[2] - b[2]);
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const length = Math.hypot(x, y);
    return [x / length, y / length, 0];
  };
  return land.map(ring => {
    const points = ring.map(project);
    const first = points.findIndex(point => point[2] >= 0);
    if (first === -1) return '';
    let previous = points[first];
    let exit: Point | undefined;
    let path = 'M' + position(previous);
    for (let step = 1; step <= points.length; step++) {
      const current = points[(first + step) % points.length];
      if (current[2] >= 0) {
        if (exit) {
          const entry = horizon(previous, current);
          const sweep = Number(exit[0] * entry[1] - exit[1] * entry[0] > 0);
          path += `A204 204 0 0 ${sweep} ${position(entry)}`;
          exit = undefined;
        }
        path += 'L' + position(current);
      } else if (previous[2] >= 0) {
        exit = horizon(previous, current);
        path += 'L' + position(exit);
      }
      previous = current;
    }
    return path + 'Z';
  }).join('');
}
