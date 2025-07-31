import { type Account, AccountService } from "@/stores/account/types";
import { useHomeworkStore } from "@/stores/homework";
import type { Homework } from "./shared/Homework";
import {error, log} from "@/utils/logger/logger";
import { translateToWeekNumber } from "pawnote";
import { pronoteFirstDate } from "./pronote/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { useClassSubjectStore } from "@/stores/classSubject";
import {MultiServiceFeature} from "@/stores/multiService/types";
import {getFeatureAccount} from "@/utils/multiservice";

/**
 * Updates the state and cache for the homework of given week number.
 */
export async function updateHomeworkForWeekInCache <T extends Account> (account: T, date: Date): Promise<void> {
  let homeworks: Homework[] = [];

  try {
    switch (account.service) {
      case AccountService.Pronote: {
        const { getHomeworkForWeek } = await import("./pronote/homework");
        const weekNumber = translateToWeekNumber(date, account.instance?.instance.firstMonday || pronoteFirstDate);
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
      case AccountService.PapillonMultiService: {
        const service = getFeatureAccount(MultiServiceFeature.Homeworks, account.localID);
        if (!service) {
          log("No service set in multi-service space for feature \"Homeworks\"", "multiservice");
          break;
        }
        return updateHomeworkForWeekInCache(service, date);
      }
      default:
        console.info(`[updateHomeworkForWeekInCache]: updating to empty since ${account.service} not implemented.`);
    }

    const weekNumber = dateToEpochWeekNumber(date);
    const existingHomeworks = (
      useHomeworkStore.getState().homeworks[weekNumber] || []
    ).filter((element) => element.personalizate);

    const mergedHomeworks = [
      ...homeworks,
      ...existingHomeworks.filter(
        (customHomework) => !homeworks.some((hw) => hw.id === customHomework.id)
      ),
    ];

    useHomeworkStore.getState().updateHomeworks(weekNumber, mergedHomeworks);
  } catch (err) {
    error(`homeworks not updated, see:${err}`, "updateHomeworkForWeekInCache");
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
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Homeworks, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Homeworks\"", "multiservice");
        break;
      }
      return toggleHomeworkState(service, homework);
    }
    default: {
      throw new Error("Service not implemented");
    }
  }
}
