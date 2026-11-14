import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

type Point = [number, number, number];
type View = { lon: number; lat: number };
const radians = Math.PI / 180;
const limitLatitude = (lat: number) => Math.max(-90, Math.min(90, lat));

function earthPoint(lon: number, lat: number): Point {
  const phi = lat * radians;
  const lambda = lon * radians;
  return [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)];
}

export default function Globe({ spanish, children, destination }: {
  spanish: boolean;
  children: (project: (lon: number, lat: number) => Point) => ReactNode;
  destination: View | null;
}) {
  const [view, setView] = useState<View>({ lon: 15, lat: 18 });
  const [zoom, setZoom] = useState(1);
  const [coasts, setCoasts] = useState<Point[][]>([]);
  const drag = useRef<{ id: number; x: number; y: number; time: number; vx: number; vy: number } | null>(null);
  const animation = useRef(0);

  useEffect(() => {
    if (!destination) return;
    cancelAnimationFrame(animation.current);
    setView(destination);
  }, [destination]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(import.meta.env.BASE_URL + 'world-outline.svg', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Map unavailable');
        return response.text();
      })
      .then(source => {
        const path = new DOMParser().parseFromString(source, 'image/svg+xml').querySelector('path')?.getAttribute('d') ?? '';
        setCoasts(path.split('M').filter(Boolean).map(line => line.split('L').map(pair => {
          const [x, y] = pair.split(' ').map(Number);
          return earthPoint(x - 180, 90 - y);
        })));
      }).catch(() => { /* The markers and place selector remain usable. */ });
    return () => {
      controller.abort();
      cancelAnimationFrame(animation.current);
    };
  }, []);

  const sinLon = Math.sin(view.lon * radians);
  const cosLon = Math.cos(view.lon * radians);
  const sinLat = Math.sin(view.lat * radians);
  const cosLat = Math.cos(view.lat * radians);
  function project([x, y, z]: Point): Point {
    const depth = x * sinLon + z * cosLon;
    return [x * cosLon - z * sinLon, depth * sinLat - y * cosLat, depth * cosLat + y * sinLat];
  }

  // Clip the coastline at the horizon so the far hemisphere stays hidden.
  const path = coasts.map(line => {
    let previous: Point | undefined;
    let outline = '';
    for (const point of line) {
      const current = project(point);
      if (previous && (previous[2] >= 0) !== (current[2] >= 0)) {
        const fraction = previous[2] / (previous[2] - current[2]);
        const x = previous[0] + (current[0] - previous[0]) * fraction;
        const y = previous[1] + (current[1] - previous[1]) * fraction;
        outline += `${current[2] >= 0 ? 'M' : 'L'}${(50 + 47 * x).toFixed(2)} ${(50 + 47 * y).toFixed(2)}`;
      }
      if (current[2] >= 0) {
        outline += `${previous ? 'L' : 'M'}${(50 + 47 * current[0]).toFixed(2)} ${(50 + 47 * current[1]).toFixed(2)}`;
      }
      previous = current;
    }
    return outline;
  }).join('');

  function rotate(lon: number, lat: number) {
    setView(previous => ({ lon: (previous.lon + lon) % 360, lat: limitLatitude(previous.lat + lat) }));
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    const last = drag.current;
    if (!last || last.id !== event.pointerId) return;
    drag.current = null;
    if (event.type !== 'pointerup' || event.timeStamp - last.time > 90 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let { vx, vy } = last;
    let time = event.timeStamp;
    function glide(now: number) {
      const elapsed = Math.min(32, Math.max(0, now - time));
      time = now;
      const decay = Math.exp(-elapsed / 170);
      vx *= decay;
      vy *= decay;
      if (Math.hypot(vx, vy) < 0.012) return;
      rotate(vx * elapsed, vy * elapsed);
      animation.current = requestAnimationFrame(glide);
    }
    animation.current = requestAnimationFrame(glide);
  }

  return <div className="world-surface" onKeyDown={event => {
    if (!['+', '=', '-', '0'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    setZoom(previous => {
      if (event.key === '0') return 1;
      return Math.min(2.5, Math.max(0.75, previous * (event.key === '-' ? 1 / 1.18 : 1.18)));
    });
  }}>
    <div className="world-drag" tabIndex={0} role="group"
      aria-label={spanish ? 'Globo interactivo. Usa las flechas para girar, más y menos para el zoom y cero para restablecerlo.' : 'Interactive globe. Use arrow keys to rotate, plus and minus to zoom, and zero to reset zoom.'}
      onKeyDown={event => {
        const direction = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, 12], ArrowDown: [0, -12] }[event.key];
        if (!direction) return;
        event.preventDefault();
        cancelAnimationFrame(animation.current);
        rotate(direction[0], direction[1]);
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        cancelAnimationFrame(animation.current);
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, vx: 0, vy: 0 };
      }}
      onPointerMove={event => {
        const start = drag.current;
        if (!start || start.id !== event.pointerId) return;
        const sensitivity = 175 / (event.currentTarget.clientWidth * zoom);
        const lon = (start.x - event.clientX) * sensitivity;
        const lat = (event.clientY - start.y) * sensitivity;
        const elapsed = Math.max(8, event.timeStamp - start.time);
        drag.current = { id: start.id, x: event.clientX, y: event.clientY, time: event.timeStamp, vx: lon / elapsed, vy: lat / elapsed };
        rotate(lon, lat);
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <g transform={`translate(50 50) scale(${zoom}) translate(-50 -50)`}>
          <circle cx="50" cy="50" r="47" className="world-rim" />
          <path d={path} className="world-coast" />
        </g>
      </svg>
    </div>
    {children((lon, lat) => {
      const [x, y, depth] = project(earthPoint(lon, lat));
      return [x * zoom, y * zoom, depth];
    })}
  </div>;
}
