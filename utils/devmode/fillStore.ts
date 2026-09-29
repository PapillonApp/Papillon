import { getWeekNumberFromDate } from "@/database/useHomework";
import { getManager, initializeAccountManager } from "@/services/shared";
import { Capabilities } from "@/services/shared/types";
import { useAccountStore } from "@/stores/account";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { log, warn } from "@/utils/logger/logger";

export type FillStoreReport = {
  lines: string[];
  skipped: string[];
  failures: string[];
  account?: { name: string; serviceCount: number };
};

const WEEKS_BEFORE = 1;
const WEEKS_AFTER = 3;

export async function fillStoreFromServices(): Promise<FillStoreReport> {
  const report: FillStoreReport = { lines: [], skipped: [], failures: [] };

  const { accounts, lastUsedAccount } = useAccountStore.getState();
  if (!lastUsedAccount) {
    report.failures.push("Aucun compte actif.");
    return report;
  }

  const account = accounts.find(item => item.id === lastUsedAccount);
  report.account = {
    name: account ? `${account.firstName} ${account.lastName}` : lastUsedAccount,
    serviceCount: account?.services.length ?? 0,
  };

  if (report.account.serviceCount === 0) {
    report.failures.push("Le compte actif n'a aucun service attaché, il n'y a donc rien à récupérer.");
    return report;
  }

  await initializeAccountManager(lastUsedAccount);
  const manager = getManager();
  if (!manager) {
    report.failures.push("Le manager n'a pas pu être initialisé.");
    return report;
  }

  const supports = (capability: Capabilities) => manager.getAvailableClients(capability).length > 0;

  const run = async (label: string, capability: Capabilities, task: () => Promise<string>) => {
    if (!supports(capability)) {
      report.skipped.push(label);
      return;
    }
    try {
      report.lines.push(`${label} : ${await task()}`);
    } catch (cause) {
      report.failures.push(`${label} : ${String(cause)}`);
      warn(`fillStore — ${label} a échoué : ${String(cause)}`, "devmode");
    }
  };

  const today = new Date();
  const weeks: { week: number; date: Date }[] = [];
  for (let offset = -WEEKS_BEFORE; offset <= WEEKS_AFTER; offset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset * 7);
    weeks.push({ week: getWeekNumberFromDate(date), date });
  }

  await run("Emploi du temps", Capabilities.TIMETABLE, async () => {
    let days = 0;
    for (const { week, date } of weeks) {
      days += (await manager.getWeeklyTimetable(week, date)).length;
    }
    return `${days} jour(s) sur ${weeks.length} semaine(s)`;
  });

  await run("Devoirs", Capabilities.HOMEWORK, async () => {
    let homeworks = 0;
    for (const { week } of weeks) {
      homeworks += (await manager.getHomeworks(week)).length;
    }
    return `${homeworks} devoir(s)`;
  });

  await run("Actualités", Capabilities.NEWS, async () => `${(await manager.getNews()).length} actualité(s)`);

  await run("Notes", Capabilities.GRADES, async () => {
    const periods = await manager.getGradesPeriods();
    if (periods.length === 0) return "aucune période";
    const period = getCurrentPeriod(periods) ?? periods[0];
    const grades = await manager.getGradesForPeriod(period, period.createdByAccount);
    return `${periods.length} période(s), « ${period.name} » : ${grades?.subjects?.length ?? 0} matière(s)`;
  });

  await run("Vie scolaire", Capabilities.ATTENDANCE_PERIODS, async () => {
    const periods = await manager.getAttendancePeriods();
    if (periods.length === 0) return "aucune période";
    if (!supports(Capabilities.ATTENDANCE)) return `${periods.length} période(s), relevé non exposé`;
    const period = getCurrentPeriod(periods) ?? periods[0];
    const attendance = await manager.getAttendanceForPeriod(period.name);
    const absences = attendance.reduce((total, item) => total + (item.absences?.length ?? 0), 0);
    const delays = attendance.reduce((total, item) => total + (item.delays?.length ?? 0), 0);
    return `« ${period.name} » : ${absences} absence(s), ${delays} retard(s)`;
  });

  await run("Menus du self", Capabilities.CANTEEN_MENU, async () => `${(await manager.getWeeklyCanteenMenu(today)).length} menu(s)`);

  await run("Messagerie", Capabilities.CHAT_READ, async () => `${(await manager.getChats()).length} conversation(s)`);

  log(
    `fillStore terminé — ${report.lines.length} remplie(s), ${report.skipped.length} ignorée(s), ${report.failures.length} en échec`,
    "devmode"
  );

  return report;
}
