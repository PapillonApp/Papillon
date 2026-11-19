const ALLOWED_DEEPLINKS_SCHEME = new Set<string>([])

export function redirectSystemPath({ path }: { path: string }) {
    const scheme = path.split(":")[0].toLowerCase()
    return ALLOWED_DEEPLINKS_SCHEME.has(scheme) ? path : "/"
}
