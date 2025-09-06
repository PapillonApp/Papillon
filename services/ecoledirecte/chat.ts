import { Account, readMessage, Session, studentReceivedMessages } from "pawdirecte";

import { warn } from "@/utils/logger/logger";

import { AttachmentType } from "../shared/attachment";
import { Chat, Message } from "../shared/chat";

export async function fetchEDChats(session: Session, account: Account, accountId: string): Promise<Chat[]> {
  try {
    const chats = await studentReceivedMessages(session, account);
    return chats.chats.map(chat => ({
      id: String(chat.id),
      subject: chat.subject,
      createdByAccount: accountId,
      creator: chat.sender,
      date: chat.date
    }))
  } catch (error) {
    warn(String(error))
    return []
  }
}

const cleanMessage = (message: string) => {
  return message.replace(/>\s+/g, ">").replace(/&nbsp;/g, " ");
};

export async function fetchEDChatMessage(session: Session, account: Account, accountId: string, chat: Chat): Promise<Message[]> {
  const message = await readMessage(session, account, Number(chat.id))
  return [{
    id: String(message.id),
    content: cleanMessage(message.content),
    author: message.sender,
    date: message.date,
    subject: message.subject,
    attachments: message.files.map(attachment => ({
      type: AttachmentType.FILE,
      name: attachment.name,
      url: String(attachment.id),
      createdByAccount: accountId
    }))
  }]
}

