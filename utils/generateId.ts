export function generateId(str: string): string {
  let hash = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");

  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash *= prime;
    hash &= BigInt("0xFFFFFFFFFFFFFFFF");
  }

  return `id-${hash.toString(36)}`;
}