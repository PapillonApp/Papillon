/* eslint-disable no-console */
// Reporting (if consent has been given)
import { useLogStore } from '@/stores/logs/index';
import { LogType } from '@/stores/logs/types';
import { checkConsent } from '@/utils/logger/consent';
import { posthog } from '@/utils/logger/posthog';
const format = "[%DATE%][%FROM%] %MESSAGE%";

const typeList = ["LOG", "ERROR", "WARN", "INFO"];

export function getIsoDate(): string {
  return new Date().toISOString();
}

function getMessage(type: number, date: string, from: string, message: string): string {
  return format
    .replaceAll("%TYPE%", typeList[type].padEnd(5))
    .replaceAll("%DATE%", date)
    .replaceAll("%FROM%", from)
    .replaceAll("%MESSAGE%", message);
}

function obtainFunctionName(from?: string): string {
  const stack = new Error().stack?.split("\n") ?? [];

  const relevant = stack.find((line, index) => 
    index > 2 &&
    line.includes("at ") &&
    line.includes("http") &&
    !line.includes("logger")
  );

  const match = relevant?.match(/at (\S+)\s*\(/);
  const functionName = match?.[1];

  if (!functionName || /^(anonymous|anon_0_)/.test(functionName)) {
    return from ?? "UNKNOWN";
  }

  return functionName;
}

function saveLog(date: string, message: string, type: LogType, from?: string) {
  useLogStore.getState().addItem({ date, message, from, type });
}

function log(message: string, from?: string): void {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  const entry = getMessage(0, date, functionName, message);
  saveLog(date, message, LogType.LOG, functionName);
  console.log(entry);
}

// Verbose, routine "step completed" narration (e.g. model updater progress,
// database queue housekeeping). Always recorded to the in-app log viewer, but
// only echoed to the console when explicitly opted into, so normal startup
// output stays focused on things that need attention.
const VERBOSE_LOGS_ENABLED = process.env.EXPO_PUBLIC_VERBOSE_LOGS === "1";

function debug(message: string, from?: string): void {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  saveLog(date, message, LogType.LOG, functionName);
  if (VERBOSE_LOGS_ENABLED) {
    const entry = getMessage(0, date, functionName, message);
    console.log(entry);
  }
}

// Native connectivity failures (no signal, DNS down, TLS/SSL failure, timeout, etc).
// These aren't application bugs, so they're kept in local logs but not reported to PostHog.
const NETWORK_ERROR_PATTERN = /fetch failed: UnexpectedException/i;

function error(message: string, from?: string): Error {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  saveLog(date, message, LogType.ERROR, functionName);
  console.error(message);
  if (!NETWORK_ERROR_PATTERN.test(message)) {
    checkConsent().then(consent => {
      if (consent.given && consent.level !== "none") {
        posthog.captureException(new Error(message));
      }
    });
  }
  return new Error(message);
}

function warn(message: string, from?: string): void {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  const entry = getMessage(2, date, functionName, message);
  saveLog(date, message, LogType.WARN, functionName);
  console.warn(entry);
}

function info(message: string, from?: string): void {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  const entry = getMessage(3, date, functionName, message);
  saveLog(date, message, LogType.INFO, functionName);
  console.info(entry);
}

export { debug, error, info, log, warn };
