/* eslint-disable no-console */
import { useLogStore } from '../../stores/logs/index'
const format = "[%TYPE%][%DATE%][%FROM%] %MESSAGE%";

const typeList = ["LOG", "ERROR", "WARN", "INFO", "NAV"];

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
  const error = new Error();
  const stack = error.stack?.split("\n") || [];

  const relevantLine = stack
    .slice(3)
    .find((line) => line.includes("at ") && line.includes("http"))
    ?.trim();

  let functionName = relevantLine && /at (\S+)\s\(/.exec(relevantLine)?.[1];
  if (functionName?.includes("anon_0_") || functionName?.includes("anonymous")) {functionName = "";}

  return functionName || from || "UNKNOWN";
}

function saveLog(log: string) {
  useLogStore.getState().addItem(log);
}

function log(message: string, from?: string): void {
  const entry = getMessage(0, getIsoDate(), obtainFunctionName(from), message);
  saveLog(entry);
  console.log(entry);
}

function error(message: string, from?: string): void {
  const entry = getMessage(1, getIsoDate(), obtainFunctionName(from), message);
  saveLog(entry);
  console.error(entry);
}

function warn(message: string, from?: string): void {
  const entry = getMessage(2, getIsoDate(), obtainFunctionName(from), message);
  saveLog(entry);
  console.warn(entry);
}

function info(message: string, from?: string): void {
  const entry = getMessage(3, getIsoDate(), obtainFunctionName(from), message);
  saveLog(entry);
  console.info(entry);
}

export { error, info, log, warn };
