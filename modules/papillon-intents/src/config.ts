import type { PapillonIntentsConfig } from "./types";

export const DEFAULT_TIMEOUT_MS = 25000;

export function definePapillonIntents(
  config: PapillonIntentsConfig
): PapillonIntentsConfig {
  const entityKeys = Object.keys(config.entities ?? {});

  if (!config.intents || config.intents.length === 0) {
    throw new Error("[papillon-intents] config.intents must not be empty.");
  }

  const seenIds = new Set<string>();
  const seenActions = new Set<string>();

  for (const intent of config.intents) {
    if (seenIds.has(intent.id)) {
      throw new Error(`[papillon-intents] duplicate intent id "${intent.id}".`);
    }
    seenIds.add(intent.id);

    if (seenActions.has(intent.action)) {
      throw new Error(
        `[papillon-intents] duplicate intent action "${intent.action}".`
      );
    }
    seenActions.add(intent.action);

    const r = intent.returns;
    if (
      (r.type === "entityList" || r.type === "entity") &&
      !entityKeys.includes(r.entity)
    ) {
      throw new Error(
        `[papillon-intents] intent "${intent.id}" returns unknown entity "${r.entity}".`
      );
    }

    for (const p of intent.parameters ?? []) {
      if (p.type === "entity" && (!p.entity || !entityKeys.includes(p.entity))) {
        throw new Error(
          `[papillon-intents] parameter "${p.name}" of intent "${intent.id}" references unknown entity "${p.entity}".`
        );
      }
      if (p.type === "enum" && (!p.values || p.values.length === 0)) {
        throw new Error(
          `[papillon-intents] enum parameter "${p.name}" of intent "${intent.id}" needs non-empty "values".`
        );
      }
    }
  }

  return config;
}
