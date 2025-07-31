import type { SkolengoAccount } from "@/stores/account/types";
import { type Homework, HomeworkReturnType } from "@/services/shared/Homework";
import {info, log} from "@/utils/logger/logger";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { HomeworkAssignment } from "scolengo-api/types/models/Calendar";
import { htmlToText } from "html-to-text";
import { decodeSkoAttachment } from "./attachment";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { toSkolengoDate } from "../skolengo-types";

const decodeHomework = (h: HomeworkAssignment): Homework => {
  return {
    id: h.id,
    subject: h.subject?.label || "",
    attachments: h.attachments?.map(decodeSkoAttachment) || [],
    color: h.subject?.color || "#000000",
    content: (h.html && htmlToText(h.html || "") !== "") ? htmlToText(h.html) : h.title ?? "",
    due: h.dueDateTime ? new Date(h.dueDateTime).getTime() : -1,
    done: h.done,
    returnType: h.deliverWorkOnline ? HomeworkReturnType.FileUpload : HomeworkReturnType.Paper,
    personalizate: false,
  };
};

export const getHomeworkForWeek = async (account: SkolengoAccount, epochWeekNumber: number): Promise<Homework[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const {start, end} = weekNumberToDateRange(epochWeekNumber);

  const homeworks = await account.instance.getHomeworkAssignments(undefined, toSkolengoDate(start), toSkolengoDate(end));

  info(`SKOLENGO->getHomeworkForWeek(): OK pour la semaine ${epochWeekNumber}.`, "skolengo");

  return homeworks.map(decodeHomework);
};

export const toggleHomeworkState = async (account: SkolengoAccount, h: Homework): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  await account.instance?.patchHomeworkAssignment(void 0, h.id, {done: !h.done});

  //await pronote.assignmentStatus(account.instance, h.id, !h.done);
  log(`SKOLENGO->toggleHomeworkState(): Homework ${h.id} marked as ${h.done ? "not done" : "done"}.`, "skolengo");
};
