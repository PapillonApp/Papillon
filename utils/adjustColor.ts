const cache = new Map<string, string>();

export default function adjust(hex: string, percent: number) {
  if (!hex) return hex;

  const key = `${hex}_${percent}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }


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

  const result = `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;

  cache.set(key, result);

  // check if result is valid HEX
  if (!/^#[0-9A-F]{6}$/i.test(result)) {
    console.error(`Invalid HEX color: ${result}`, 'adjustColor');
    return hex;
  }

  return result;
}
