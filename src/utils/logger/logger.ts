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
    .replaceAll("%TYPE%", type_list[type])
    .replaceAll("%DATE%", date)
    .replaceAll("%FROM%", from)
    .replaceAll("%MESSAGE%", message)
  );
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
  if (!functionName || functionName.includes("anon")) functionName = "UNKOWN";

  return functionName;
}

function save_logs_to_memory (log: string)
{
  AsyncStorage.getItem("logs")
    .then((result) => {
      let logs = [];
      if (result != null)
        logs = JSON.parse(result);
      logs.push(log);
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
  console.log(log);
}

function warn (message: string, from?: string): void {
  let log = get_message(2, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.log(log);
}

function info (message: string, from?: string): void {
  let log = get_message(3, get_iso_date(), obtain_function_name(from), message);
  save_logs_to_memory(log);
  console.log(log);
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
}

async function get_logs (): Promise<Log[]> {
  let returned: Log[] = [];
  let value: string[] = [];

  let res = await AsyncStorage.getItem("logs");
  if (res) value = JSON.parse(res);

  value.forEach((item) => {
    let arr = item.split("]");
    returned.push({
      type: arr[0].replace("[", ""),
      date: arr[1].replace("[", ""),
      from: arr[2].replace("[", ""),
      message: arr[3].trim()
    });
  });

  return returned;
}

const delete_logs = async () => {
  await AsyncStorage.removeItem("logs");
};

export { log, error, warn, info, navigate, get_logs, get_brute_logs, delete_logs };
