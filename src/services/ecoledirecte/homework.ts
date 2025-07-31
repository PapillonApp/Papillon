import ecoledirecte, { ClassSubject } from "pawdirecte";
import type { Homework } from "@/services/shared/Homework";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDaysList } from "@/utils/epochWeekNumber";
import { log } from "@/utils/logger/logger";
import { AttachmentType } from "../shared/Attachment";
import { formatDate } from "@/services/ecoledirecte/format-date";

const cleanContent = (message: string) => {
  return message.replace(/>\s+/g, ">").replace(/&nbsp;/g, " ");
};

export const getHomeworkForWeek = async (
  account: EcoleDirecteAccount,
  weekNumber: number,
): Promise<{ homework: Homework[]; subjects: ClassSubject[] }> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const weekdays = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];
  let classSubjects: ClassSubject[] = [];
  for (const date of weekdays) {
    const formattedDate = formatDate(date);

    const { homeworks, subjects } = await ecoledirecte.studentHomeworks(
      account.authentication.session,
      account.authentication.account,
      formattedDate,
    );

    classSubjects = [...classSubjects, subjects].flat();

    for (const homework of homeworks) {
      response.push({
        attachments: homework.attachments.map((att) => ({
          url: `${att.name}\\${att.id}\\${att.kind}`,
          type: AttachmentType.File, // no links as attachements in ed,
          name: att.name,
        })),
        color: "#000000", // TODO
        content: cleanContent(homework.content),
        done: homework.done,
        due: date.getTime(),
        id: homework.id.toString(),
        subject: homework.subject,
        exam: homework.exam,
        personalizate: false,
      });
    }
  }

  return { homework: response.filter((hw) => hw.content !== ""), subjects: classSubjects };
};

export const toggleHomeworkState = async (
  account: EcoleDirecteAccount,
  homework: Homework,
): Promise<void> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");
  await ecoledirecte.setHomeworkState(
    account.authentication.session,
    account.authentication.account,
    Number(homework.id),
    !homework.done,
  );
  log(
    `Homework ${homework.id} marked as ${homework.done ? "not done" : "done"}.`,
    "ED->toggleHomeworkState",
  );
};
