export function generateId(str?: string): string {
  const input = str ?? "";
  let hash = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");

  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash *= prime;
    hash &= BigInt("0xFFFFFFFFFFFFFFFF");
  }

  return `id-${hash.toString(36)}`;
}
