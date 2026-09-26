import { Model, Q } from "@nozbe/watermelondb";

import { Chat as SharedChat, Message as SharedMessage, Recipient as SharedRecipient } from "@/services/shared/chat";
import { generateId } from "@/utils/generateId";
import { error } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapChatsToShared, mapMessagesToShared, mapRecipientsToShared } from "./mappers/chats";
import { Chat, Message, Recipient } from "./models/Chat";
import { safeWrite } from "./utils/safeTransaction";

export async function addChatsToDatabase(chats: SharedChat[]) {
  const db = getDatabaseInstance();
  for (const item of chats) {
    const id = generateId(item.createdByAccount + item.subject + item.date)
    const existing = await db.get('chats').query(Q.where('chatId', id)).fetch();

    if (existing.length === 0) {
      await safeWrite(db, async () => {
        await db.get('chats').create((record: Model) => {
          const chat = record as Chat;
          Object.assign(chat, {
            chatId: id,
            subject: item.subject,
            recipient: item.recipient,
            creator: item.creator,
            date: item.date.getTime(),
            createdByAccount: item.createdByAccount
          })
        })
      }, 10000, 'addChatsToDatabase')
    }
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
      Q.where('recipientId', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await safeWrite(db, async () => {
      await db.get('recipients').create((record: Model) => {
        const recipient = record as Recipient;
        Object.assign(recipient, {
          recipientId: id,
          name: item.name,
          class: item.class,
          chatId: chatId
        })
      })
    }, 10000, 'addRecipientsToDatabase')
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
      Q.where('messageId', id)
    ).fetch();

    if (existing.length > 0) {continue;}
		
    await safeWrite(db, async () => {
      await db.get('messages').create((record: Model) => {
        const message = record as Message;
        Object.assign(message, {
          messageId: id,
          subject: item.subject,
          content: item.content,
          author: item.author,
          date: item.date.getTime(),
          attachments: JSON.stringify(item.attachments),
          chatId: chatId
        })
      })
    }, 10000, 'addMessagesToDatabase')
  }
}

export async function getChatsFromCache(): Promise<SharedChat[]> {
  try {
    const database = getDatabaseInstance();
    const chats = await database.get<Chat>('chats').query();

    return mapChatsToShared(chats)
  } catch (e) {
    error(String(e));
  }
}

export async function getRecipientsFromCache(chat: SharedChat): Promise<SharedRecipient[]> {
  try {
    const database = getDatabaseInstance();
    const chatId = generateId(chat.createdByAccount + chat.subject + chat.date);
    const recipients = await database.get<Recipient>('recipients').query(
      Q.where('chatId', chatId)
    ).fetch();

    return mapRecipientsToShared(recipients);
  } catch (e) {
    error(String(e));
  }
}

export async function getMessagesFromCache(chat: SharedChat): Promise<SharedMessage[]> {
  try {
    const database = getDatabaseInstance();
    const chatId = generateId(chat.createdByAccount + chat.subject + chat.date);
    const messages = await database.get<Message>('messages').query(
      Q.where('chatId', chatId)
    ).fetch();

    return mapMessagesToShared(messages);
  } catch (e) {
    error(String(e));
  }
}
