import { LinksignClient } from "@studentsphere/linksign";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";
import { error } from "@/utils/logger/logger";

export async function fetchEdusignHomeworks(
  client: LinksignClient,
  accountId: string,
  weekNumberRaw: number
): Promise<Homework[]> {
  const result: Homework[] = [];
  try {
    const { start, end } = getDateRangeOfWeek(weekNumberRaw);
    const startMs = start.getTime();
    const endMs = end.getTime();
    const past = await client.getAssessments("past");
    const future = await client.getAssessments("future");

    const assessments = [...(past.data || []), ...(future.data || [])];
    const filteredAssessments = assessments.filter((assessment: any) => {
      if (!assessment || !assessment.deadlineDate) return false;
      const dueDate = new Date(assessment.deadlineDate);
      const dueDateMs = dueDate.getTime();
      return !isNaN(dueDateMs) && dueDateMs >= startMs && dueDateMs <= endMs;
    });

    for (const rawAssessment of filteredAssessments) {
      const assessment = rawAssessment as any;
      const dueDate = new Date(assessment.deadlineDate);

      let description = "";
      let attachments: any[] = [];
      try {
        const detail = await client.getAssessmentDetailById(assessment.id);
        if (detail?.description) {
          description = detail.description;
        }
        if (detail?.link) {
          attachments.push({
            type: "link",
            name: "Lien de l'évaluation",
            url: detail.link,
            createdByAccount: accountId,
          });
        }
      } catch (err) { }

      result.push({
        id: assessment.id,
        subject: assessment.name || "Devoir",
        content: description,
        dueDate: dueDate,
        isDone: assessment.status === "done",
        attachments: attachments,
        evaluation: assessment.gradingType !== null,
        custom: false,
        createdByAccount: accountId,
      });
    }
  } catch (err) {
    return [];
  }

  return result;
}
