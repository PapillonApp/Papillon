// Home screen widgets are iOS-only for now, so this is what every other
// platform gets: a no-op that keeps `@expo/ui/swift-ui` out of their bundle.
// `useWidgetSync.ios.ts` holds the real implementation.
export const useWidgetSync = (): void => undefined;
