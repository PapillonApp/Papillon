export default function adjust(hex: string, percent: number) {
  if (!hex) return hex;
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const num = parseInt(hex, 16);
  let r = num >> 16;
  let g = (num >> 8) & 0x00FF;
  let b = num & 0x0000FF;

  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);

  r = Math.round(r + (t - r) * p);
  g = Math.round(g + (t - g) * p);
  b = Math.round(b + (t - b) * p);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
}
