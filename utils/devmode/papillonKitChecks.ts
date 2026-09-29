import { Platform } from "react-native";
import { Q } from "@nozbe/watermelondb";
import * as PapillonKit from "@getpapillon/papillonkit";
import type { DebugSnapshot, IndexReport, JSONSchema, WidgetDiagnostics } from "@getpapillon/papillonkit";

import { database } from "@/database";
import Homework from "@/database/models/Homework";
import Course from "@/database/models/Timetable";
import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";

export type CheckStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export type CheckResult = {
  status: CheckStatus;
  detail?: string;
  duration?: number;
};

export type CheckSection = "Module" | "Données" | "Siri et Spotlight" | "Widgets" | "Apple Intelligence";

export type CheckContext = {
  snapshot?: DebugSnapshot;
  index?: IndexReport;
  indexCleared?: boolean;
  widgetsReloadedAt?: number;
};

export type Check = {
  id: string;
  section: CheckSection;
  title: string;
  timeout?: number;
  run: (context: CheckContext) => Promise<string | void>;
};

export const CHECK_SECTIONS: CheckSection[] = ["Module", "Données", "Siri et Spotlight", "Widgets", "Apple Intelligence"];

class Skip extends Error {
  readonly skipped = true;
}

const skip = (reason: string): never => {
  throw new Skip(reason);
};

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const iosMajor = () => Number.parseInt(String(Platform.Version), 10);

const yesNo = (value: boolean) => (value ? "oui" : "non");

const formatDate = (value: number) =>
  new Date(value).toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTime = (value: number) => new Date(value).toLocaleTimeString("fr-FR");

const markWidgetsReloaded = (context: CheckContext, at: number) => {
  context.widgetsReloadedAt = Math.min(context.widgetsReloadedAt ?? at, at);
};

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

const loadSnapshot = async (context: CheckContext) => {
  const snapshot = await PapillonKit.getDebugSnapshot();
  ensure(snapshot, "getDebugSnapshot() a renvoyé null.");
  context.snapshot = snapshot;
  return snapshot;
};

const accounts = () => useAccountStore.getState().accounts;

const currentAccount = () => {
  const { accounts: all, lastUsedAccount } = useAccountStore.getState();
  return all.find(account => account.id === lastUsedAccount);
};

const allServiceIds = () => accounts().flatMap(account => account.services.map(service => service.id));

const errorCode = async (body: () => Promise<unknown>) => {
  try {
    await body();
  } catch (error) {
    ensure(error instanceof PapillonKit.IntelligenceError, `Erreur reçue sans le type IntelligenceError : ${String(error)}`);
    return error.code;
  }
  throw new Error("L'appel a réussi alors qu'il devait échouer.");
};

const INTELLIGENCE_LABELS: Record<string, string> = {
  available: "disponible",
  deviceNotEligible: "appareil non compatible",
  appleIntelligenceNotEnabled: "désactivée dans Réglages",
  modelNotReady: "modèle en téléchargement",
  unknown: "état inconnu",
  unsupported: "non supportée",
};

const PLAN_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Titre court de la tâche" },
    priority: { type: "string", enum: ["basse", "moyenne", "haute"] },
    steps: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    minutes: { type: "integer", minimum: 5, maximum: 180 },
  },
  required: ["title", "priority", "steps", "minutes"],
};

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const WEEK_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    sessions: { type: "array", items: { $ref: "#/$defs/Session" }, minItems: 2, maxItems: 3 },
    advice: { type: "string", nullable: true },
  },
  required: ["subject", "sessions"],
  $defs: {
    Session: {
      type: "object",
      properties: {
        day: { type: "string", enum: DAYS },
        minutes: { type: "integer", minimum: 10, maximum: 90 },
        focus: { type: "string" },
      },
      required: ["day", "minutes", "focus"],
    },
  },
};

const requireModel = () => {
  const availability = PapillonKit.intelligence.getAvailability();
  if (availability.status !== "available") {
    skip(`Apple Intelligence ${INTELLIGENCE_LABELS[availability.status] ?? availability.status}.`);
  }
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const inRange = (value: unknown, minimum: number, maximum: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum;

const moduleChecks: Check[] = [
  {
    id: "module",
    section: "Module",
    title: "Module natif chargé",
    run: async () => {
      ensure(PapillonKit.isSupported, "Le module natif n'est pas lié à cette build.");
      return `iOS ${Platform.Version}`;
    },
  },
  {
    id: "features",
    section: "Module",
    title: "Fonctions activées selon la version d'iOS",
    run: async context => {
      const major = iosMajor();
      const expected = { siri: major >= 27, intelligence: major >= 26, widgets: true };
      const { features } = PapillonKit;
      const wrong = (Object.keys(expected) as (keyof typeof expected)[]).filter(key => features[key] !== expected[key]);
      ensure(wrong.length === 0, `Attendu pour iOS ${major} : ${JSON.stringify(expected)}, reçu ${JSON.stringify(features)}.`);
      const snapshot = await loadSnapshot(context);
      ensure(
        (Object.keys(expected) as (keyof typeof expected)[]).every(key => snapshot.features[key] === features[key]),
        `debugSnapshot() annonce ${JSON.stringify(snapshot.features)}.`
      );
      return `Siri ${yesNo(features.siri)} · Apple Intelligence ${yesNo(features.intelligence)} · widgets ${yesNo(features.widgets)}`;
    },
  },
];

const dataChecks: Check[] = [
  {
    id: "app-groups",
    section: "Données",
    title: "App Groups accessibles",
    run: async context => {
      const { appGroups } = context.snapshot ?? (await loadSnapshot(context));
      ensure(appGroups.storage.reachable, `${appGroups.storage.identifier} inaccessible (stockage des comptes).`);
      ensure(appGroups.database.reachable, `${appGroups.database.identifier} inaccessible (base).`);
      return `${appGroups.storage.identifier} · ${appGroups.database.identifier}`;
    },
  },
  {
    id: "database",
    section: "Données",
    title: "Base partagée lisible",
    run: async context => {
      const { database: shared } = context.snapshot ?? (await loadSnapshot(context));
      ensure(shared.exists, `Aucune base à ${shared.path ?? "(chemin inconnu)"}.`);
      ensure(!shared.error, shared.error ?? "");
      return `${shared.courseCount} cours · ${shared.homeworkCount} devoirs`;
    },
  },
  {
    id: "course-count",
    section: "Données",
    title: "Même nombre de cours que l'app",
    run: async context => {
      const snapshot = await loadSnapshot(context);
      const expected = await database.get<Course>("courses").query().fetchCount();
      ensure(snapshot.database.courseCount === expected, `App : ${expected}, PapillonKit : ${snapshot.database.courseCount}.`);
      return `${expected} cours`;
    },
  },
  {
    id: "homework-count",
    section: "Données",
    title: "Même nombre de devoirs que l'app",
    run: async context => {
      const snapshot = context.snapshot ?? (await loadSnapshot(context));
      const expected = await database.get<Homework>("homework").query().fetchCount();
      ensure(snapshot.database.homeworkCount === expected, `App : ${expected}, PapillonKit : ${snapshot.database.homeworkCount}.`);
      return `${expected} devoirs`;
    },
  },
  {
    id: "accounts",
    section: "Données",
    title: "Mêmes comptes que l'app",
    run: async context => {
      const snapshot = context.snapshot ?? (await loadSnapshot(context));
      ensure(!snapshot.accountsError, `Lecture des comptes : ${snapshot.accountsError}`);
      const native = (snapshot.accounts ?? []).map(account => account.id).sort();
      const expected = accounts().map(account => account.id).sort();
      ensure(
        JSON.stringify(native) === JSON.stringify(expected),
        `App : ${expected.length} compte(s), PapillonKit : ${native.length}.`
      );
      const current = snapshot.accounts?.find(account => account.isCurrent);
      const lastUsed = useAccountStore.getState().lastUsedAccount;
      ensure((current?.id ?? null) === (lastUsed || null), "Le compte actif n'est pas le même.");
      return current ? `${native.length} compte(s), actif : ${current.name}` : `${native.length} compte(s), aucun actif`;
    },
  },
  {
    id: "next-course",
    section: "Données",
    title: "Même prochain cours que l'app",
    run: async context => {
      const account = currentAccount() ?? skip("Aucun compte actif.");
      const snapshot = await loadSnapshot(context);
      const rows = await database
        .get<Course>("courses")
        .query(
          Q.where("createdByAccount", Q.oneOf(account.services.map(service => service.id))),
          Q.where("to", Q.gt(Date.now()))
        )
        .fetch();
      const upcoming = rows.filter(course => course.status !== CourseStatus.CANCELED).sort((a, b) => a.from - b.from);
      const native = snapshot.nextCourse ?? null;
      const first = upcoming[0];

      if (!first) {
        ensure(!native, `PapillonKit propose ${native?.title} alors que l'app n'a aucun cours à venir.`);
        return "Aucun cours à venir, des deux côtés";
      }
      ensure(native, `L'app a ${first.subject} le ${formatDate(first.from)}, PapillonKit ne trouve rien.`);
      const tied = upcoming.filter(course => course.from === first.from).map(course => course.courseId);
      ensure(
        native.from === first.from && tied.includes(native.id),
        `App : ${first.subject} (${formatDate(first.from)}), PapillonKit : ${native.title} (${formatDate(native.from)}).`
      );
      return `${native.emoji} ${native.title}, ${formatDate(native.from)}`;
    },
  },
  {
    id: "next-homework",
    section: "Données",
    title: "Même prochain devoir que l'app",
    run: async context => {
      const account = currentAccount() ?? skip("Aucun compte actif.");
      const snapshot = context.snapshot ?? (await loadSnapshot(context));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rows = await database
        .get<Homework>("homework")
        .query(
          Q.where("createdByAccount", Q.oneOf(account.services.map(service => service.id))),
          Q.where("dueDate", Q.gte(today.getTime()))
        )
        .fetch();
      const pending = rows.filter(homework => !homework.isDone).sort((a, b) => a.dueDate - b.dueDate);
      const native = snapshot.nextHomework ?? null;
      const first = pending[0];

      if (!first) {
        ensure(!native, `PapillonKit propose ${native?.title} alors que l'app n'a aucun devoir à faire.`);
        return "Aucun devoir à faire, des deux côtés";
      }
      ensure(native, `L'app a un devoir de ${first.subject} pour le ${formatDate(first.dueDate)}, PapillonKit ne trouve rien.`);
      const tied = pending.filter(homework => homework.dueDate === first.dueDate).map(homework => homework.homeworkId);
      ensure(
        native.dueDate === first.dueDate && tied.includes(native.id),
        `App : ${first.subject} (${formatDate(first.dueDate)}), PapillonKit : ${native.title} (${formatDate(native.dueDate)}).`
      );
      return `${native.emoji} ${native.title}, pour le ${formatDate(native.dueDate)}`;
    },
  },
  {
    id: "refresh",
    section: "Données",
    title: "refresh()",
    run: async context => {
      const before = Date.now();
      const report = await PapillonKit.refresh();
      ensure(report, "refresh() a renvoyé null.");
      markWidgetsReloaded(context, before);
      ensure(report.errors.length === 0, report.errors.join("\n"));
      ensure(report.date >= before - 1000, `Rapport daté du ${formatDate(report.date)}, avant l'appel.`);
      if (PapillonKit.features.siri) {
        ensure(report.index, "L'index Spotlight n'a pas été reconstruit.");
      } else {
        ensure(report.index === null, "L'index ne devrait pas être touché avant iOS 27.");
      }
      const snapshot = await loadSnapshot(context);
      ensure(snapshot.lastRefresh?.date === report.date, "debugSnapshot() ne voit pas ce rafraîchissement.");
      return report.index
        ? `${report.index.indexedCourses} cours et ${report.index.indexedHomework} devoirs indexés, widgets rechargés`
        : "Widgets rechargés";
    },
  },
];

const siriChecks: Check[] = [
  {
    id: "reindex",
    section: "Siri et Spotlight",
    title: "reindex()",
    run: async context => {
      const report = await PapillonKit.reindex();
      ensure(report, "reindex() a renvoyé null.");
      ensure(report.windowStart < report.windowEnd, "La fenêtre d'indexation est vide.");
      ensure(
        report.indexedAccounts === accounts().length,
        `${report.indexedAccounts} compte(s) indexé(s), l'app en a ${accounts().length}.`
      );
      context.index = report;
      return `${report.indexedCourses} cours, ${report.indexedHomework} devoirs, du ${formatDate(report.windowStart)} au ${formatDate(report.windowEnd)}`;
    },
  },
  {
    id: "index-parity",
    section: "Siri et Spotlight",
    title: "L'index contient tout ce que l'app affiche",
    run: async context => {
      const report = context.index ?? skip("reindex() a échoué.");
      const services = allServiceIds();
      const courses = await database
        .get<Course>("courses")
        .query(
          Q.where("createdByAccount", Q.oneOf(services)),
          Q.where("to", Q.gte(report.windowStart)),
          Q.where("from", Q.lte(report.windowEnd))
        )
        .fetchCount();
      const homework = await database
        .get<Homework>("homework")
        .query(
          Q.where("createdByAccount", Q.oneOf(services)),
          Q.where("dueDate", Q.between(report.windowStart, report.windowEnd))
        )
        .fetchCount();
      ensure(report.indexedCourses === courses, `Cours : ${courses} dans l'app, ${report.indexedCourses} indexés.`);
      ensure(report.indexedHomework === homework, `Devoirs : ${homework} dans l'app, ${report.indexedHomework} indexés.`);
      return `${courses} cours et ${homework} devoirs, des deux côtés`;
    },
  },
  {
    id: "reindex-stable",
    section: "Siri et Spotlight",
    title: "Réindexer sans changement ne retire rien",
    run: async context => {
      const first = context.index ?? skip("reindex() a échoué.");
      const second = await PapillonKit.reindex();
      ensure(second, "reindex() a renvoyé null.");
      ensure(second.removed === 0, `${second.removed} élément(s) retiré(s) alors que rien n'a changé.`);
      ensure(
        second.indexedCourses === first.indexedCourses && second.indexedHomework === first.indexedHomework,
        "Les nombres ont changé entre deux indexations. Une synchro tournait peut-être en même temps."
      );
      return "0 retiré";
    },
  },
  {
    id: "clear-index",
    section: "Siri et Spotlight",
    title: "clearIndex()",
    timeout: 40000,
    run: async context => {
      await PapillonKit.clearIndex();
      context.indexCleared = true;
      return "Index vidé";
    },
  },
  {
    id: "reindex-after-clear",
    section: "Siri et Spotlight",
    title: "reindex() reconstruit l'index vidé",
    timeout: 40000,
    run: async context => {
      const first = context.index ?? skip("reindex() a échoué.");
      if (!context.indexCleared) skip("clearIndex() a échoué.");
      const rebuilt = await PapillonKit.reindex();
      ensure(rebuilt, "reindex() a renvoyé null après clearIndex().");
      ensure(rebuilt.removed === 0, `${rebuilt.removed} élément(s) retiré(s) d'un index censé être vide.`);
      ensure(
        rebuilt.indexedCourses === first.indexedCourses && rebuilt.indexedHomework === first.indexedHomework,
        "L'index reconstruit n'a pas le même contenu."
      );
      return `${rebuilt.indexedCourses} cours et ${rebuilt.indexedHomework} devoirs remis dans Spotlight`;
    },
  },
];

const siriFallbackChecks: Check[] = [
  {
    id: "siri-fallback",
    section: "Siri et Spotlight",
    title: "Désactivé proprement avant iOS 27",
    run: async () => {
      ensure((await PapillonKit.reindex()) === null, "reindex() devrait renvoyer null.");
      await PapillonKit.clearIndex();
      return "reindex() renvoie null, clearIndex() ne fait rien";
    },
  },
];

const widgetDiagnosticsCheck = (kind: "Calendar" | "Tasks", title: string): Check => ({
  id: `widget-${kind}`,
  section: "Widgets",
  title,
  timeout: 15000,
  run: async context => {
    const reloadedAt = context.widgetsReloadedAt ?? skip("Le rechargement des widgets a échoué.");
    let entry: WidgetDiagnostics | undefined = (await loadSnapshot(context)).widgets.diagnostics[kind];
    if (!entry) {
      skip("Jamais affiché. Pose-le sur l'écran d'accueil pour le tester.");
    }
    for (let attempt = 0; attempt < 16 && entry && entry.date < reloadedAt; attempt++) {
      await wait(500);
      entry = (await loadSnapshot(context)).widgets.diagnostics[kind];
    }
    ensure(entry, "Diagnostic disparu pendant le test.");
    ensure(!entry.error, entry.error ?? "");
    if (currentAccount()) {
      ensure(entry.accountId, "Le widget ne trouve aucun compte.");
    }
    const when = entry.date >= reloadedAt
      ? `redessiné à ${formatTime(entry.date)}`
      : `pas redessiné depuis le rechargement de ${formatTime(reloadedAt)}, dernier rendu à ${formatTime(entry.date)}`;
    return `${entry.itemCount} élément(s), ${when}`;
  },
});

const widgetChecks: Check[] = [
  {
    id: "widget-snapshot",
    section: "Widgets",
    title: "widgets.reload() écrit le snapshot",
    run: async context => {
      const before = Date.now();
      PapillonKit.widgets.reload();
      const snapshot = await loadSnapshot(context);
      const written = snapshot.widgets.snapshotDate;
      ensure(written && written >= before - 1000, `Snapshot pas mis à jour (dernier : ${written ? formatDate(written) : "jamais"}).`);
      markWidgetsReloaded(context, before);
      return `Écrit à ${formatTime(written)}`;
    },
  },
  widgetDiagnosticsCheck("Calendar", "Widget Emploi du temps"),
  widgetDiagnosticsCheck("Tasks", "Widget Tâches"),
];

const intelligenceChecks: Check[] = [
  {
    id: "availability",
    section: "Apple Intelligence",
    title: "Disponibilité du modèle",
    run: async context => {
      const availability = PapillonKit.intelligence.getAvailability();
      const snapshot = context.snapshot ?? (await loadSnapshot(context));
      ensure(snapshot.intelligence.status === availability.status, "debugSnapshot() et getAvailability() ne sont pas d'accord.");
      const label = INTELLIGENCE_LABELS[availability.status] ?? availability.status;
      if (availability.status === "available") {
        return `Disponible · langue de l'appareil supportée : ${yesNo(availability.supportsLocale)}`;
      }
      const code = await errorCode(() => PapillonKit.intelligence.generateText("Bonjour"));
      ensure(code === "ERR_INTELLIGENCE_UNAVAILABLE", `Code reçu : ${code}.`);
      return `Indisponible (${label}), generateText() renvoie bien ERR_INTELLIGENCE_UNAVAILABLE`;
    },
  },
  {
    id: "invalid-schema",
    section: "Apple Intelligence",
    title: "Schéma invalide refusé",
    run: async () => {
      requireModel();
      const code = await errorCode(() =>
        PapillonKit.intelligence.generateObject("x", { schema: { type: "object", properties: {} } })
      );
      ensure(code === "ERR_INTELLIGENCE_INVALID_SCHEMA", `Code reçu : ${code}.`);
      return "ERR_INTELLIGENCE_INVALID_SCHEMA";
    },
  },
  {
    id: "generate-text",
    section: "Apple Intelligence",
    title: "generateText()",
    timeout: 60000,
    run: async () => {
      requireModel();
      const text = await PapillonKit.intelligence.generateText("Réponds uniquement par le mot bonjour.", {
        temperature: 0,
        maximumResponseTokens: 20,
      });
      ensure(text.toLowerCase().includes("bonjour"), `Réponse : « ${text} »`);
      return `« ${text.trim().slice(0, 60)} »`;
    },
  },
  {
    id: "generate-object",
    section: "Apple Intelligence",
    title: "generateObject() respecte le schéma",
    timeout: 60000,
    run: async () => {
      requireModel();
      const plan = await PapillonKit.intelligence.generateObject<Record<string, unknown>>(
        "Je dois réviser le chapitre 4 de physique sur l'électricité pour un contrôle vendredi.",
        { instructions: "Tu aides un élève à organiser son travail.", schema: PLAN_SCHEMA, temperature: 0 }
      );
      ensure(isText(plan.title), `title invalide : ${JSON.stringify(plan.title)}`);
      ensure(["basse", "moyenne", "haute"].includes(plan.priority as string), `priority hors enum : ${JSON.stringify(plan.priority)}`);
      ensure(
        Array.isArray(plan.steps) && plan.steps.length >= 1 && plan.steps.length <= 4 && plan.steps.every(isText),
        `steps invalide : ${JSON.stringify(plan.steps)}`
      );
      ensure(inRange(plan.minutes, 5, 180), `minutes hors bornes : ${JSON.stringify(plan.minutes)}`);
      return `${plan.title} · ${plan.priority} · ${(plan.steps as string[]).length} étape(s) · ${plan.minutes} min`;
    },
  },
  {
    id: "generate-nested",
    section: "Apple Intelligence",
    title: "generateObject() avec $ref et tableau d'objets",
    timeout: 60000,
    run: async () => {
      requireModel();
      const week = await PapillonKit.intelligence.generateObject<Record<string, unknown>>(
        "Prévois mes séances de révision de maths pour cette semaine, j'ai un contrôle sur les fonctions.",
        { instructions: "Tu aides un élève à organiser son travail.", schema: WEEK_SCHEMA, temperature: 0 }
      );
      ensure(isText(week.subject), `subject invalide : ${JSON.stringify(week.subject)}`);
      const sessions = week.sessions;
      ensure(
        Array.isArray(sessions) && sessions.length >= 2 && sessions.length <= 3,
        `sessions : ${JSON.stringify(sessions)}`
      );
      for (const session of sessions as Record<string, unknown>[]) {
        ensure(DAYS.includes(session.day as string), `day hors enum : ${JSON.stringify(session.day)}`);
        ensure(inRange(session.minutes, 10, 90), `minutes hors bornes : ${JSON.stringify(session.minutes)}`);
        ensure(isText(session.focus), `focus invalide : ${JSON.stringify(session.focus)}`);
      }
      ensure(week.advice == null || typeof week.advice === "string", `advice invalide : ${JSON.stringify(week.advice)}`);
      return (sessions as { day: string; minutes: number }[]).map(session => `${session.day} ${session.minutes} min`).join(" · ");
    },
  },
];

const intelligenceFallbackChecks: Check[] = [
  {
    id: "intelligence-fallback",
    section: "Apple Intelligence",
    title: "Désactivée proprement avant iOS 26",
    run: async () => {
      const availability = PapillonKit.intelligence.getAvailability();
      ensure(availability.status === "unsupported", `Statut : ${availability.status}.`);
      const code = await errorCode(() => PapillonKit.intelligence.generateText("Bonjour"));
      ensure(code === "ERR_INTELLIGENCE_UNAVAILABLE", `Code reçu : ${code}.`);
      return "unsupported, generateText() renvoie ERR_INTELLIGENCE_UNAVAILABLE";
    },
  },
];

export function buildChecks(): Check[] {
  if (!PapillonKit.isSupported) {
    return [moduleChecks[0]];
  }
  return [
    ...moduleChecks,
    ...dataChecks,
    ...(PapillonKit.features.siri ? siriChecks : siriFallbackChecks),
    ...(PapillonKit.features.widgets ? widgetChecks : []),
    ...(PapillonKit.features.intelligence ? intelligenceChecks : intelligenceFallbackChecks),
  ];
}

export async function runCheck(check: Check, context: CheckContext): Promise<CheckResult> {
  const start = Date.now();
  const limit = check.timeout ?? 20000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const detail = await Promise.race([
      check.run(context),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Pas de réponse après ${limit / 1000} s.`)), limit);
      }),
    ]);
    return { status: "passed", detail: detail || undefined, duration: Date.now() - start };
  } catch (error) {
    const duration = Date.now() - start;
    if ((error as { skipped?: boolean }).skipped) {
      return { status: "skipped", detail: (error as Error).message, duration };
    }
    const code = (error as { code?: string }).code;
    const message = (error as Error).message ?? String(error);
    return { status: "failed", detail: code ? `${code} : ${message}` : message, duration };
  } finally {
    clearTimeout(timer);
  }
}

const SYMBOLS: Record<CheckStatus, string> = {
  pending: "·",
  running: "…",
  passed: "✓",
  failed: "✗",
  skipped: "–",
};

export function formatDuration(milliseconds: number) {
  return milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(1).replace(".", ",")} s`;
}

export function formatReport(checks: Check[], results: Record<string, CheckResult>) {
  const { features } = PapillonKit;
  const lines = [
    `PapillonKit · iOS ${Platform.Version} · ${new Date().toLocaleString("fr-FR")}`,
    `Siri ${yesNo(features.siri)} · Apple Intelligence ${yesNo(features.intelligence)} · widgets ${yesNo(features.widgets)}`,
  ];
  for (const section of CHECK_SECTIONS) {
    const inSection = checks.filter(check => check.section === section);
    if (inSection.length === 0) continue;
    lines.push("", section);
    for (const check of inSection) {
      const result = results[check.id] ?? { status: "pending" };
      const duration = result.duration != null ? ` (${formatDuration(result.duration)})` : "";
      lines.push(`${SYMBOLS[result.status]} ${check.title}${duration}`);
      if (result.detail) lines.push(`    ${result.detail}`);
    }
  }
  return lines.join("\n");
}
