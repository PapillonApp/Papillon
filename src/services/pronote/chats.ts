import { PronoteAccount } from "@/stores/account/types";
import { Chat, ChatMessage } from "../shared/Chat";
import pronote from "pawnote";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import { Recipient } from "../shared/Recipient";
import { info } from "@/utils/logger/logger";

export const getChats = async (account: PronoteAccount): Promise<Array<Chat>> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const chats = await pronote.discussions(account.instance);
  info("PRONOTE->getChats(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  return chats.items.map((chat) => {
    return {
      id: chat.participantsMessageID,
      read: true,
      subject: chat.subject,
      creator: chat.creator ?? studentName,
      recipient: chat.recipientName ?? studentName,
      _handle: chat
    };
  });
};

export const getChatMessages = async (account: PronoteAccount, chat: Chat): Promise<Array<ChatMessage>> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const messages = await pronote.discussionMessages(account.instance, <pronote.Discussion>chat._handle);
  info("PRONOTE->getChatMessages(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  return messages.sents.map((message) => {
    return {
      id: message.id,
      subject: "",
      content: message.content,
      author: message.author?.name ?? studentName,
      date: message.creationDate,
      attachments: message.files.map(decodeAttachment)
    };
  });
};

export const createDiscussionRecipients = async (account: PronoteAccount): Promise<Recipient[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const user = account.instance.user.resources[0];
  const recipientsALL = await Promise.all([
    pronote.EntityKind.Teacher,
    pronote.EntityKind.Personal
  ].map(kind => pronote.newDiscussionRecipients(account.instance!, user, kind)));

  const recipients = recipientsALL.flat();
  info("PRONOTE->createDiscussionRecipients(): OK", "pronote");

  return recipients.map((recipient) => ({
    name: recipient.name,
    _handle: recipient
  }));
};

export const createDiscussion = async (account: PronoteAccount, subject: string, content: string, recipients: Recipient[]): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.newDiscussion(account.instance, subject, content, recipients.map(r => r._handle));
  info("PRONOTE->createDiscussion(): OK", "pronote");
};
