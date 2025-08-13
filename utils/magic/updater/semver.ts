export type SemverTuple = [number, number, number];

export function parse(v: string): SemverTuple {
  const [maj = "0", min = "0", patch = "0"] = v
    .replace(/^v/i, "")
    .trim()
    .split(".");
  return [
    parseInt(maj, 10) || 0,
    parseInt(min, 10) || 0,
    parseInt(patch, 10) || 0,
  ];
}

export function cmp(a: string, b: string): number {
  const aa = parse(a);
  const bb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (aa[i] > bb[i]) return 1;
    if (aa[i] < bb[i]) return -1;
  }
  return 0;
}

export function satisfies(version: string, constraint: string): boolean {
  const range = constraint.trim();
  const dash = range.match(/^(\S+)\s*-\s*(\S+)$/);
  if (dash) {
    const [, lo, hi] = dash;
    return cmp(version, lo) >= 0 && cmp(version, hi) <= 0;
  }
  const m = range.match(/^(>=|<=|>|<|=)?\s*(\S+)$/);
  if (!m) return false;
  const op = m[1] || "=";
  const v = m[2];
  switch (op) {
    case ">":
      return cmp(version, v) > 0;
    case ">=":
      return cmp(version, v) >= 0;
    case "<":
      return cmp(version, v) < 0;
    case "<=":
      return cmp(version, v) <= 0;
    case "=":
      return cmp(version, v) === 0;
    default:
      return false;
  }
}

export function satisfiesAll(version: string, constraints: string[]): boolean {
  return constraints.every(c => satisfies(version, c));
}
