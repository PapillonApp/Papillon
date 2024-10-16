import { type Account, AccountService } from "@/stores/account/types";
import { useHomeworkStore } from "@/stores/homework";
import type { Homework } from "./shared/Homework";
import { error } from "@/utils/logger/logger";
import { translateToWeekNumber } from "pawnote";
import { pronoteFirstDate } from "./pronote/timetable";
import { dateToEpochWeekNumber, epochWNToPronoteWN } from "@/utils/epochWeekNumber";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { useClassSubjectStore } from "@/stores/classSubject";

/**
 * Updates the state and cache for the homework of given week number.
 */
export async function updateHomeworkForWeekInCache <T extends Account> (account: T, date: Date): Promise<void> {
  let homeworks: Homework[] = [];

  try {
    switch (account.service) {
      case AccountService.Pronote: {
        const { getHomeworkForWeek } = await import("./pronote/homework");
        const weekNumber = translateToWeekNumber(date, account.instance?.instance.firstDate || pronoteFirstDate);
        homeworks = await getHomeworkForWeek(account, weekNumber);
        break;
      }
      case AccountService.Skolengo: {
        if(!checkIfSkoSupported(account, "Homeworks")) {
          error("[updateHomeworkForWeekInCache]: This Skolengo instance doesn't support Homeworks.", "skolengo");
          break;
        }
        const { getHomeworkForWeek } = await import("./skolengo/data/homework");
        const weekNumber = dateToEpochWeekNumber(date);
        homeworks = await getHomeworkForWeek(account, weekNumber);
        break;
      }
      case AccountService.EcoleDirecte: {
        const { getHomeworkForWeek } = await import("./ecoledirecte/homework");
        const weekNumber = dateToEpochWeekNumber(date);
        let response = await getHomeworkForWeek(account, weekNumber);
        homeworks = response.homework;
        useClassSubjectStore.getState().pushSubjects(response.subjects);
        break;
      }
      case AccountService.Local: {
        homeworks = [];
        break;
      }
      default:
        console.info(`[updateHomeworkForWeekInCache]: updating to empty since ${account.service} not implemented.`);
    }

    useHomeworkStore.getState().updateHomeworks(dateToEpochWeekNumber(date), homeworks);
  }
  catch (err) {
    error(`not updated, see:${err}`, "updateHomeworkForWeekInCache");
  }
}

export async function toggleHomeworkState <T extends Account> (account: T, homework: Homework): Promise<void> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { toggleHomeworkState } = await import("./pronote/homework");
      await toggleHomeworkState(account, homework);
      break;
    }
    case AccountService.EcoleDirecte: {
      const { toggleHomeworkState } = await import("./ecoledirecte/homework");
      await toggleHomeworkState(account, homework);
      break;
    }
    case AccountService.Local: {
      break;
    }
    default: {
      throw new Error("Service not implemented");
    }
  }
}
