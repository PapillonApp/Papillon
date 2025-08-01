import { Skolengo } from "skolengojs";
import { Homework, ReturnFormat } from "../shared/homework";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Attachment, AttachmentType } from "../shared/attachment";

export async function fetchSkolengoHomeworks(session: Skolengo, accountId: string, weekNumber: number): Promise<Homework[]> {
	const {start, end} = getDateRangeOfWeek(weekNumber)
	const homeworks = await session.GetAssignments(start, end)
	const attachments: Record<string, Attachment[]> = {}

	for (const homework of homeworks) {
		const homeworkAttachments = await homework.getAttachments()
		attachments[homework.id] = homeworkAttachments.map(attachment => ({
			type: AttachmentType.FILE,
			name: attachment.fileName ?? "",
			url: attachment.url,
			createdByAccount: accountId
		}))
	}

	return homeworks.map(homework => ({
		createdByAccount: accountId,
		id: homework.id,
		subject: homework.subject.label,
		content: homework.html,
		dueDate: homework.dueDateTime,
		isDone: homework.done,
		returnFormat: homework.deliverWorkOnline ? ReturnFormat.FILE_UPLOAD : ReturnFormat.PAPER,
		attachments: attachments[homework.id],
		evaluation: false,
		custom: false
	}))
}