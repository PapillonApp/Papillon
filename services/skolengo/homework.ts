import { Attachment as SkolengoAttachment, Kind, Skolengo } from "skolengojs";
import { Homework, ReturnFormat } from "../shared/homework";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Attachment, AttachmentType } from "../shared/attachment";
import { error } from "@/utils/logger/logger";

export async function fetchSkolengoHomeworks(session: Skolengo, accountId: string, weekNumber: number): Promise<Homework[]> {
	const {start, end} = getDateRangeOfWeek(weekNumber)
	const attachments: Record<string, Attachment[]> = {}
	const result: Homework[] = [];

	const getHomeworks = async (sessionToUse: Skolengo, kidName?: string) => {
		const homeworks = await sessionToUse.GetAssignments(start, end);
		for (const homework of homeworks) {
			const homeworkAttachments = await homework.getAttachments();
			attachments[homework.id] = homeworkAttachments.map((attachment: SkolengoAttachment) => ({
				type: AttachmentType.FILE,
				name: attachment.fileName ?? "",
				url: attachment.url,
				createdByAccount: accountId,
				kidName: kidName
			}));

			result.push({
				createdByAccount: accountId,
				id: homework.id,
				subject: homework.subject.label,
				content: homework.html,
				dueDate: homework.dueDateTime,
				isDone: homework.done,
				returnFormat: homework.deliverWorkOnline ? ReturnFormat.FILE_UPLOAD : ReturnFormat.PAPER,
				attachments: attachments[homework.id],
				evaluation: false,
				custom: false,
				ref: homework,
				kidName: kidName
			});
		}
	};

	if (session.kind === Kind.STUDENT) {
		await getHomeworks(session);
	} else {
		for (const kid of session.kids ?? []) {
			await getHomeworks(kid, `${kid.firstName} ${kid.lastName}`);
		}
	}

	return result;
}

export async function setSkolengoHomeworkAsDone(accountId: string, homework: Homework, status?: boolean): Promise<Homework> {
	if (!homework.ref) {
		error("Invalid Homework Reference")
	}

	const state = await homework.ref.setCompletion(status || !homework.isDone)
	let attachments: Attachment[] = []

	const homeworkAttachments = await state.getAttachments()
	attachments = homeworkAttachments.map(attachment => ({
		type: AttachmentType.FILE,
		name: attachment.fileName ?? "",
		url: attachment.url,
		createdByAccount: accountId
	}))
	return {
		createdByAccount: accountId,
		id: state.id,
		subject: state.subject.label,
		content: state.html,
		dueDate: state.dueDateTime,
		isDone: state.done,
		returnFormat: state.deliverWorkOnline ? ReturnFormat.FILE_UPLOAD : undefined,
		attachments: attachments,
		evaluation: false,
		custom: false,
		ref: state
	}
}