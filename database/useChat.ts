import { Model, Q } from "@nozbe/watermelondb";

import { Chat as SharedChat, Message as SharedMessage, Recipient as SharedRecipient } from "@/services/shared/chat";
import { generateId } from "@/utils/generateId";
import { error } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { Chat, Message, Recipient } from "./models/Chat";

export async function addChatsToDatabase(chats: SharedChat[]) {
  const db = getDatabaseInstance();
  for (const item of chats) {
    const id = generateId(item.createdByAccount + item.subject + item.date)
    const existing = await db.get('chats').query(
      Q.where('id', id)
    ).fetch();

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('chats').create((record: Model) => {
        const chat = record as Chat;
        Object.assign(chat, {
          id: id,
          subject: item.subject,
          recipient: item.recipient,
          creator: item.creator,
          date: item.date.getTime(),
          createdByAccount: item.createdByAccount
        })
      })
    })
  }
}

export async function addRecipientsToDatabase(chat: SharedChat, recipients: SharedRecipient[]) {
  const db = getDatabaseInstance();
  const chatId = generateId(chat.createdByAccount + chat.subject + chat.date)
  const dbChat = await db.get('chats').find(chatId);
  if (!dbChat) {
    error("We're unable to find the chat in cache, please rehydrate chats before...")
  }

  for (const item of recipients) {
    const id = generateId(chatId + item.name + item.class)
    const existing = await db.get('recipients').query(
      Q.where('id', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await db.write(async () => {
      await db.get('recipients').create((record: Model) => {
        const recipient = record as Recipient;
        Object.assign(recipient, {
          id: id,
          name: item.name,
          class: item.class,
          chatId: chatId
        })
      })
    })
  }
}

export async function addMessagesToDatabase(chat: SharedChat, messages: SharedMessage[]) {
  const db = getDatabaseInstance();
  const chatId = generateId(chat.createdByAccount + chat.subject + chat.date)
  const dbChat = await db.get('chats').find(chatId);
  if (!dbChat) {
    error("We're unable to find the chat in cache, please rehydrate chats before...")
  }

  for (const item of messages) {
    const id = generateId(chatId + item.content + item.author + item.date + item.subject)
    const existing = await db.get('messages').query(
      Q.where('id', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await db.write(async () => {
      await db.get('messages').create((record: Model) => {
        const message = record as Message;
        Object.assign(message, {
          id: id,
          subject: item.subject,
          content: item.content,
          author: item.author,
          date: item.date.getTime(),
          attachments: JSON.stringify(item.attachments),
          chatId: chatId
        })
      })
    })
  }
}