const ALLOWED_ROUTER_SCHEMES = new Set([
  "papillon",
  "exp+papillon",
  "exp",
  "exps",
]);
const EXTERNAL_AUTH_SCHEMES = new Set(["izly", "skoapp-prod"]);

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial?: boolean;
}): string | null {
  if (!path) {
    return initial ? "/" : null;
  }

  if (path.startsWith("/")) {
    return path;
  }

  const colonIndex = path.indexOf(":");
  const scheme = colonIndex >= 0 ? path.slice(0, colonIndex).toLowerCase() : "";

  if (EXTERNAL_AUTH_SCHEMES.has(scheme)) {
    return initial ? "/" : null;
  }

  if (ALLOWED_ROUTER_SCHEMES.has(scheme)) {
    return path;
  }

  return initial ? "/" : null;
}
