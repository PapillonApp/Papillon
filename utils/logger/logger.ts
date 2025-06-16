/* eslint-disable no-console */
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

function saveLog(date: string, message: string, type: "LOG" | "WARN" | "ERROR" | "INFO") {
  useLogStore.getState().addItem({ date, message, type });
}

function log(message: string, from?: string): void {
  const date = getIsoDate()
  const entry = getMessage(0, date, obtainFunctionName(from), message);
  saveLog(date, message, "LOG");
  console.log(entry);
}

function error(message: string, from?: string): void {
  const date = getIsoDate()
  const entry = getMessage(1, date, obtainFunctionName(from), message);
  saveLog(date, entry, "ERROR");
  console.error(entry);
}

function warn(message: string, from?: string): void {
  const date = getIsoDate()
  const entry = getMessage(2, date, obtainFunctionName(from), message);
  saveLog(date, entry, "WARN");
  console.warn(entry);
}

function info(message: string, from?: string): void {
  const date = getIsoDate()  
  const entry = getMessage(3, date, obtainFunctionName(from), message);
  saveLog(date, entry, "INFO");
  console.info(entry);
}

export { error, info, log, warn };
