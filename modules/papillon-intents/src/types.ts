export type LogLevel = "off" | "error" | "warn" | "debug";

export type PropertyType =
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "bool"
  | "bool?"
  | "date"
  | "date?";

export interface EntityPropertyDef {
  type: PropertyType;
  title?: string;
  queryable?: boolean;
  searchable?: boolean;
}

export interface EntityImageDef {
  systemImage?: string;
  systemImageField?: string;
  urlField?: string;
}

export interface EntityDef {
  typeName: string;
  typeDisplayName: string;
  display: { title: string; subtitle?: string; image?: EntityImageDef };
  properties: Record<string, EntityPropertyDef>;
  defaultQueryProperty?: string;
  stringQueryProperties?: string[];
  indexed?: boolean;
}

export type ParameterType =
  | "string"
  | "number"
  | "bool"
  | "date"
  | "enum"
  | "entity";

export interface ParameterDef {
  name: string;
  type: ParameterType;
  title: string;
  optional?: boolean;
  values?: string[];
  entity?: string;
}

export type ReturnShape =
  | { type: "entityList"; entity: string; dialog?: string }
  | { type: "entity"; entity: string; dialog?: string }
  | { type: "dialog"; dialog: string }
  | { type: "value"; dialog?: string };

export interface IntentDef {
  id: string;
  action: string;
  title: string;
  description?: string;
  phrases?: string[];
  shortTitle?: string;
  systemImage?: string;
  openAppWhenRun?: boolean;
  requiresAuth?: boolean;
  timeoutMs?: number;
  donate?: boolean;
  parameters?: ParameterDef[];
  returns: ReturnShape;
}

export interface Settings {
  appGroup?: string;
  defaultTimeoutMs?: number;
  logLevel?: LogLevel;
  backgroundLaunch?: boolean;
  cache?: { enabled: boolean; ttlMs?: number };
  donations?: { enabled: boolean };
  spotlight?: { enabled: boolean };
}

export interface PapillonIntentsConfig {
  settings?: Settings;
  entities: Record<string, EntityDef>;
  intents: IntentDef[];
}

export interface IntentRequestEvent {
  requestId: string;
  action: string;
  params: Record<string, unknown>;
}

export type IntentHandler = (
  params: Record<string, unknown>
) => Promise<unknown> | unknown;
