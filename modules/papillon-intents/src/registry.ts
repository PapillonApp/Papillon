import PapillonIntents from "./PapillonIntentsModule";
import type {
  IntentHandler,
  IntentRequestEvent,
  LogLevel,
  Settings,
} from "./types";

const handlers = new Map<string, IntentHandler>();
let subscribed = false;
let currentLogLevel: LogLevel = "warn";

const LEVELS: Record<LogLevel, number> = {
  off: 0,
  error: 1,
  warn: 2,
  debug: 3,
};

const CONSOLE_METHODS: Record<Exclude<LogLevel, "off">, "log" | "warn" | "error"> = {
  debug: "log",
  warn: "warn",
  error: "error",
};

function log(level: Exclude<LogLevel, "off">, ...args: unknown[]) {
  if (LEVELS[currentLogLevel] < LEVELS[level]) return;
  console[CONSOLE_METHODS[level]]("[papillon-intents]", ...args);
}

async function dispatch(event: IntentRequestEvent) {
  const handler = handlers.get(event.action);
  if (!handler) {
    log("warn", `no handler registered for action "${event.action}"`);
    PapillonIntents.rejectRequest(
      event.requestId,
      `No handler registered for action "${event.action}".`
    );
    return;
  }

  log("debug", `dispatching "${event.action}"`, event.params);
  try {
    const result = await handler(event.params ?? {});
    PapillonIntents.resolveRequest(
      event.requestId,
      JSON.stringify(result ?? null)
    );
    log("debug", `resolved "${event.action}"`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", `handler for "${event.action}" failed:`, message);
    PapillonIntents.rejectRequest(event.requestId, message);
  }
}

function ensureSubscription() {
  if (subscribed) return;
  subscribed = true;
  PapillonIntents.addListener("onIntentRequest", (event) => {
    void dispatch(event);
  });
}

export function registerHandler(action: string, handler: IntentHandler): void {
  handlers.set(action, handler);
  ensureSubscription();
  PapillonIntents.markReady();
}

export function registerHandlers(map: Record<string, IntentHandler>): void {
  for (const [action, handler] of Object.entries(map)) {
    handlers.set(action, handler);
  }
  ensureSubscription();
  PapillonIntents.markReady();
}

export function unregisterHandler(action: string): void {
  handlers.delete(action);
}

export function configure(settings: Settings): void {
  if (settings.logLevel) currentLogLevel = settings.logLevel;
  PapillonIntents.configure(JSON.stringify(settings));
}

export function primeCache(entityType: string, items: unknown[]): void {
  PapillonIntents.setCache(entityType, JSON.stringify(items));
}

export function readCache(entityType: string): string | null {
  return PapillonIntents.getCache(entityType);
}
