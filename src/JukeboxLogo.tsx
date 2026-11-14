const CX = 14.8;
const CY = 15;
// Logo 2 — vortex mosaic: concentric rows of chunky tiles with clear gaps,
// row seams deliberately misaligned so no radial spokes appear; tail thinning
// at top-right and an opening on the right where the sound wave exits.
const ROWS = [
  { r: 3.4, size: 1.4, offset: 0 },
  { r: 5.6, size: 1.7, offset: 14 },
  { r: 7.8, size: 2, offset: 27 },
  { r: 10, size: 2.3, offset: 41 },
  { r: 12.4, size: 2.6, offset: 56 },
];
const GAP = 1.15;

function swirlTiles() {
  const rects = [];
  ROWS.forEach((row, i) => {
    const stepDeg = (row.size + GAP) / row.r * 180 / Math.PI;
    for (let a = row.offset; a < row.offset + 360; a += stepDeg) {
      const norm = ((a % 360) + 360) % 360;
      const inOpening = i >= 3 && (norm > 348 || norm < 60);
      const inTail = i >= 4 && norm >= 60 && norm <= 95 && Math.round((a - row.offset) / stepDeg) % 2 === 0;
      if (inOpening || inTail) continue;
      const rad = a * Math.PI / 180;
      rects.push(<rect
        key={`${i}-${Math.round(a * 10)}`}
        x={CX + row.r * Math.cos(rad) - row.size / 2}
        y={CY + row.r * Math.sin(rad) - row.size / 2}
        width={row.size} height={row.size} rx={.32} />);
    }
  });
  return rects;
}

export default function JukeboxLogo() {
  return <svg className="jukebox-logo" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="jbl-tiles" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9be4ff" />
        <stop offset=".5" stopColor="#c0a0ff" />
        <stop offset="1" stopColor="#ff6ec7" />
      </linearGradient>
      <linearGradient id="jbl-wave" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#83eaf4" />
        <stop offset="1" stopColor="#f28bd7" />
      </linearGradient>
    </defs>
    <g fill="url(#jbl-tiles)">{swirlTiles()}</g>
    <path d="M4.5 15h5.5l1.5-2 2 5.5 1.5-8 2 6.5 1.5-3.5 2 2.5 1.5-2 1 1h5"
      fill="none" stroke="url(#jbl-wave)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity=".28" />
    <path d="M4.5 15h5.5l1.5-2 2 5.5 1.5-8 2 6.5 1.5-3.5 2 2.5 1.5-2 1 1h5"
      fill="none" stroke="url(#jbl-wave)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
