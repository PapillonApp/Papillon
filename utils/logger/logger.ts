/* eslint-disable no-console */
import { LogType } from '@/stores/logs/types';

// Reporting (if consent has been given)
import Countly from 'countly-sdk-react-native-bridge';

import { useLogStore } from '../../stores/logs/index'
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

  // Does NOT sends anything to the server --> only if crash happens
  Countly.addCrashLog(message);
}

function log(message: string, from?: string): void {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  const entry = getMessage(0, date, functionName, message);
  saveLog(date, message, LogType.LOG, functionName);
  console.log(entry);
}

function error(message: string, from?: string): never {
  const date = getIsoDate()
  const functionName = obtainFunctionName(from)
  const entry = getMessage(1, date, functionName, message);
  saveLog(date, message, LogType.ERROR, functionName);
  console.error(message);
  Countly.logException(message, true, JSON.parse(JSON.stringify(entry)));
  throw new Error(entry);

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

export { error, info, log, warn };
