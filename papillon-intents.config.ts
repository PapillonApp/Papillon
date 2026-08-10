import type { PapillonIntentsConfig } from "papillon-intents";
import { entities } from "@/intents/entities";
import { intents } from "@/intents/intents";

const config: PapillonIntentsConfig = {
  settings: {
    appGroup: "group.xyz.getpapillon.ios",
    defaultTimeoutMs: 25000,
    logLevel: "warn",
    backgroundLaunch: true,
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    donations: { enabled: true },
    spotlight: { enabled: false },
  },
  entities,
  intents,
};

export default config;
