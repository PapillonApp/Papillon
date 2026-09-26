import { createTransportClient, type TransportClient } from "papillon-transport";

import packageJson from "@/package.json";

let instance: TransportClient | undefined;

export function client(): TransportClient {
  instance ??= createTransportClient({
    userAgent: `Papillon/${packageJson.version} (+https://github.com/PapillonApp/Papillon)`,
  });
  return instance;
}
