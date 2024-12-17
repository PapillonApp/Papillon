import { type Account, AccountService } from "@/stores/account/types";
import type { Period } from "./shared/Period";
import { useAttendanceStore } from "@/stores/attendance";
import { Attendance } from "./shared/Attendance";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error } from "@/utils/logger/logger";

export async function updateAttendancePeriodsInCache <T extends Account> (account: T): Promise<void> {
  let periods: Period[] = [];
  let defaultPeriod: string;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getAttendancePeriods } = await import("./pronote/attendance");
      const output = getAttendancePeriods(account);

      periods = output.periods;
      defaultPeriod = output.default;

      break;
    }
    case AccountService.EcoleDirecte: {
      periods = [
        {
          name: "Toutes",
          startTimestamp: new Date("2024-09-28").getTime(),
          endTimestamp: new Date("2024-09-28").getTime(),
        },
      ];

      defaultPeriod = "Toutes";

      break;
    }
    case AccountService.Local: {
      periods = [
        {
          name: "Toutes",
          startTimestamp: new Date("2021-09-01").getTime(), //not relevant to ED
          endTimestamp: new Date("2022-06-30").getTime(),
        },
      ];

      defaultPeriod = "Toutes";

      break;
    }
    case AccountService.Skolengo: {
      const { getPeriod } = await import("./skolengo/data/period");
      const output = await getPeriod(account);

      periods = [
        {
          name: "Toutes",
          startTimestamp: Math.min(...output.map(e=>e.startTimestamp)),
          endTimestamp: Math.max(...output.map(e=>e.endTimestamp)),
        },
      ];

      defaultPeriod = "Toutes";

      break;
    }
    default:
      throw new Error("Service not implemented");
  }

  useAttendanceStore.getState().updatePeriods(periods, defaultPeriod);
}

export async function updateAttendanceInCache <T extends Account> (account: T, periodName: string): Promise<void> {
  let attendance: Attendance|null = null;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getAttendance } = await import("./pronote/attendance");
      attendance = await getAttendance(account, periodName);

      break;
    }
    case AccountService.EcoleDirecte: {
      const { getAttendance } = await import("./ecoledirecte/attendance");
      attendance = await getAttendance(account);
      break;
    }
    case AccountService.Local: {
      if (account.identityProvider.identifier == "iut-lannion") {
        const { saveIUTLanAttendance } = await import("./iutlan/attendance");
        const data = await saveIUTLanAttendance(account);

        attendance = {
          delays: data.delays,
          absences: data.absences,
          punishments: data.punishments,
          observations: data.observations
        };
      }
      else {
        attendance = {
          delays: [],
          absences: [],
          punishments: [],
          observations: []
        };
      }

      break;
    }
    case AccountService.Skolengo: {
      if(!checkIfSkoSupported(account, "Attendance")) {
        error("[updateAttendanceInCache]: This Skolengo instance doesn't support Homeworks.", "skolengo");
        break;
      }
      const { getAttendance } = await import("./skolengo/data/attendance");
      attendance = await getAttendance(account);

      break;
    }
    default:
      throw new Error("Service not implemented");
  }
  if (attendance)
    useAttendanceStore.getState().updateAttendance(periodName, attendance);
}
