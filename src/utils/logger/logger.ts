import AsyncStorage from "@react-native-async-storage/async-storage";

const format: string = "[%TYPE%][%DATE%][%FROM%] %MESSAGE%";
const type_list = [
  "LOG",
  "ERROR",
  "WARN",
  "INFO",
  "NAV"
];

export function get_iso_date () {
  let now = new Date();
  return now.toISOString();
}

function get_message (type: number, date: string, from: string, message: string): string
{
  return (format
    .replaceAll("%TYPE%", type_list[type].padEnd(5))
    .replaceAll("%DATE%", date)
    .replaceAll("%FROM%", from)
    .replaceAll("%MESSAGE%", message)
  );
}

function get_file_from_stacktrace (stack: string): string
{
  let res = "";
  try {
    res = stack
      .split("\n")[1]
      .split(/\/\/localhost:\d\d\d\d\//g)[1]
      .split("//&")[0];
  } catch (e) {
    res = "UNKNOWN";
  }
  return (res);
}

function obtain_function_name (from?: string): string {
  const error = new Error(); // On génère une erreur pour obtenir la stacktrace
  const stack = error.stack?.split("\n") || [];

  const relevantLine = stack
    .slice(3) // Ignore les premières lignes (celle du logger)
    .find((line) => line.includes("at ") && line.includes("http")) // Recherche une ligne pertinente
    ?.trim();

  // Extraire le nom de la fonction ou utiliser `from` si on trouve pas
  let functionName = (relevantLine && RegExp(/at (\S+)\s\(/).exec(relevantLine)?.[1]) ?? from;
  // `anon` cherche à matcher avec `anonymous` et `?anon_0_` qui sont des fonctions anonymes
  if (functionName?.includes("anon_0_") || functionName?.includes("anonymous")) functionName = "";

  return functionName || (from ?? "UNKOWN");
}

function save_logs_to_memory (log: string) {
  AsyncStorage.getItem("logs").then((result) => {
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    let logs: string[] = [];

    if (result != null) {
      logs = JSON.parse(result) as string[];
    }
    logs.push(log);

    logs = logs.filter((element) => {
      const match = element.split("]")[1].replace("[", "");
      if (match) {
        const logDate = new Date(match).getTime();
        return logDate >= twoWeeksAgo;
      }
      return false;
    });

    if (logs.length > 800) {
      logs = logs.splice(0, 100);
    }

    AsyncStorage.setItem("logs", JSON.stringify(logs));
  });
}

function log (message: string, from?: string): void {
  let log = get_message(0, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.log(log);
}

function error (message: string, from?: string): void {
  let log = get_message(1, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.error(log);
}

function warn (message: string, from?: string): void {
  let log = get_message(2, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.warn(log);
}

function info (message: string, from?: string): void {
  let log = get_message(3, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.info(log);
}

function navigate (to: string): void {
  let log = get_message(4, get_iso_date(), "ROUTER", "User navigate into " + to);
  save_logs_to_memory(log);
  console.log(log);
}

async function get_brute_logs (): Promise<string> {
  let res = await AsyncStorage.getItem("logs");
  let value = [];
  if (res)
    value = JSON.parse(res);
  return value.join("\n");
}

export interface Log {
  type: string;
  date: string;
  from?: string;
  message: string;
  formattedDate?: string;
}

async function get_logs (): Promise<Log[]> {
  let returned: Log[] = [];
  let value: string[] = [];

  let res = await AsyncStorage.getItem("logs");
  if (res) value = JSON.parse(res);

  value.forEach((item) => {
    const matchs = /\[([A-Z\s]+)\]\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z)]\[(\S+)\] (.+)/gm.exec(item);
    returned.push({
      type: matchs?.[1]! ?? "Unkown type", // The index 0 is used for the global match
      date: matchs?.[2]! ?? "Unkown date",
      from: matchs?.[3]! ?? "Unkown from",
      message: matchs?.[4]! ?? "Unkown content"
    });
  });

  return returned;
}

const delete_logs = async () => {
  await AsyncStorage.removeItem("logs");
};

export { log, error, warn, info, navigate, get_logs, get_brute_logs, delete_logs };
