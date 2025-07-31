import { Attachment } from "@/services/shared/attachment";
import { Chat as SharedChat, Message as SharedMessage,Recipient as SharedRecipient } from "@/services/shared/chat";

import { Chat, Message, Recipient } from "../models/Chat";
import { parseJsonArray } from "../useHomework";

export function mapChatsToShared(data: Chat[]): SharedChat[] {
  return data.map(chat => ({
    fromCache: true,
    createdByAccount: chat.createdByAccount,
    id: chat.id,
    subject: chat.subject,
    recipient: chat.recipient,
    creator: chat.creator,
    date: new Date(chat.date)
  }))
}

export function mapRecipientsToShared(data: Recipient[]): SharedRecipient[] {
  return data.map(recipient => ({
    id: recipient.id,
    name: recipient.name,
    class: recipient.class 
  }))
}

export function mapMessagesToShared(data: Message[]): SharedMessage[] {
  return data.map(message => ({
    id: message.id,
    content: message.content,
    author: message.author,
    subject: message.subject,
    date: new Date(message.date),
    attachments: parseJsonArray(message.attachments) as Attachment[]
  }));
}