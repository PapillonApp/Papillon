import { Mail, Recipients, Skolengo } from "skolengojs";
import { Chat, Message, Recipient } from "../shared/chat";
import { error } from "@/utils/logger/logger";

export async function fetchSkolengoChats(session: Skolengo, accountId: string): Promise<Chat[]> {
	const folders = await session.GetAllMails()
	const mails: Chat[] = folders.flatMap(folder => 
		folder.mails?.map(chat => ({
			id: chat.id,
			subject: chat.subject,
			recipient: chat.participants.join(", "),
			creator: chat.sender?.name,
			date: chat.date,
			ref: chat,
			createdByAccount: accountId
		})) || []
	)

	return mails
}

export async function fetchSkolengoChatRecipients(chat: Chat): Promise<Recipient[]> {
	if (!chat.ref && (typeof chat.ref !== typeof Mail)) {
		error("Invalid Chat Reference")
	}

	return (chat.ref instanceof Mail) ? chat.ref.participants?.map(p => ({
		id: p,
		name: p
	})) : []
}

export async function fetchSkolengoChatMessages(chat: Chat): Promise<Message[]> {
	if (!chat.ref && (typeof chat.ref !== typeof Mail)) {
		error("Invalid Chat Reference")
	}

	const messages = (chat.ref instanceof Mail) ? await chat.ref.getMessages() : error("Invalid Chat Reference");
	return messages.map(message => ({
		id: message.id,
		content: message.content,
		author: message.author.name,
		subject: "",
		date: message.date,
		attachments: []
	}))
}

export async function fetchSkolengoAvailableRecipients(session: Skolengo): Promise<Recipient[]> {
	const recipients = await session.GetMailSettings()
	return recipients.recipients.map(recipient => ({
		id: recipient.id,
		name: recipient.id,
		ref: recipient
	}))
}

export async function createSkolengoMail(session: Skolengo, accountId: string, subject: string, content: string, recipients: Recipient[], cc?: Recipient[], bcc?: Recipient[]): Promise<Chat> {
	const mail = await session.SendMail(subject, content, sharedToSkolengoRecipient(recipients), sharedToSkolengoRecipient(cc ?? []), sharedToSkolengoRecipient(bcc ?? []))
	return {
		id: mail.id,
		subject: subject,
		recipient: recipients.map(r => r.name).join(", "),
		creator: mail.sender?.name,
		date: new Date(),
		ref: mail,
		createdByAccount: accountId
	}
}

function sharedToSkolengoRecipient(recipients: Recipient[]): Recipients[] {
	return recipients.map(recipient => {
		if (!recipient.ref || typeof recipient.ref !== 'object' || !('type' in recipient.ref)) {
			throw new Error('Invalid recipient reference');
		}
		return {
			id: recipient.id,
			type: (recipient.ref).type
		};
	});
}