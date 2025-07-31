import type { PronoteAccount } from "@/stores/account/types";
import { type Homework, HomeworkReturnType } from "@/services/shared/Homework";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import pronote from "pawnote";
import {info, log} from "@/utils/logger/logger";

const decodeHomework = (h: pronote.Assignment): Homework => {
  return {
    id: h.id,
    subject: h.subject.name,
    attachments: h.attachments.map(decodeAttachment),
    color: h.backgroundColor,
    content: h.description,
    due: h.deadline.getTime(),
    done: h.done,
    returnType: (h.return && h.return.kind !== pronote.AssignmentReturnKind.None)
      ? h.return.kind === pronote.AssignmentReturnKind.Paper ? HomeworkReturnType.Paper : HomeworkReturnType.FileUpload
      : void 0,
    personalizate: false,
  };
};

export const getHomeworkForWeek = async (account: PronoteAccount, weekNumber: number): Promise<Homework[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  if (weekNumber < 1 || weekNumber > 62) {
    info("PRONOTE->getHomeworkForWeek(): Le numéro de semaine est en dehors des bornes (1<>62), une liste vide est retournée.", "pronote");
    return [];
  }

  const homeworks = await pronote.assignmentsFromWeek(account.instance, weekNumber);
  info(`PRONOTE->getHomeworkForWeek(): OK pour la semaine ${weekNumber}.`, "pronote");

  return homeworks.map(decodeHomework);
};

export const toggleHomeworkState = async (account: PronoteAccount, h: Homework): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.assignmentStatus(account.instance, h.id, !h.done);
  log(`Homework ${h.id} marked as ${h.done ? "not done" : "done"}.`, "PRONOTE->toggleHomeworkState");
};
