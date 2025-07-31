import { PronoteAccount } from "@/stores/account/types";
import { Chat, ChatMessage, ChatRecipient } from "../shared/Chat";
import pronote from "pawnote";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import { Recipient } from "../shared/Recipient";
import { info } from "@/utils/logger/logger";

export const getChats = async (account: PronoteAccount): Promise<Array<Chat>> => {
  if (!account.instance) {
    throw new ErrorServiceUnauthenticated("pronote");
  }

  const chats = await pronote.discussions(account.instance);
  info("PRONOTE->getChats(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  const parseFrenchDate = (dateText: string): Date => {
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const parts = dateText.split(" ");
    const datePart = parts.find(part => part.includes("/"));

    if (datePart) {
      const [day, month, year] = datePart.split("/");
      return new Date(`20${year}-${month}-${day}`);
    }

    const today = new Date();
    const todayIndex = today.getDay();
    const dayName = parts[0].toLowerCase();
    const targetIndex = days.indexOf(dayName);

    if (targetIndex !== -1) {
      const diff = targetIndex - todayIndex;
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + (diff <= 0 ? diff : diff - 7));
      return targetDate;
    }

    return today;
  };

  return chats.items.map((chat) => ({
    id: chat.participantsMessageID,
    read: true,
    subject: chat.subject,
    creator: chat.creator ?? studentName,
    recipient: chat.recipientName ?? studentName,
    date: parseFrenchDate(chat.dateAsFrenchText),
    _handle: chat
  }));
};

export const getChatRecipients = async (account: PronoteAccount, chat: Chat): Promise<ChatRecipient[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const recipients = await pronote.discussionRecipients(account.instance, <pronote.Discussion>chat._handle);
  return recipients.map((recipient) => {
    const [namePart, classPart] = recipient.name.split("(");

    return {
      id: recipient.id,
      name: namePart.trim(),
      class: classPart ? classPart.replace(")", "").trim() : null
    };
  });
};

export const sendMessageInChat = async (account: PronoteAccount, chat: Chat, content: string): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.discussionSendMessage(account.instance, chat._handle, content);
};

export const getChatMessages = async (account: PronoteAccount, chat: Chat): Promise<Array<ChatMessage>> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const messages = await pronote.discussionMessages(account.instance, <pronote.Discussion>chat._handle);
  info("PRONOTE->getChatMessages(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  messages.sents.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());

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

  const recipientsALL = await Promise.all(
    account.instance!.user!.resources.flatMap(resource =>
      [
        pronote.EntityKind.Teacher,
        pronote.EntityKind.Personal
      ].map(kind => pronote.newDiscussionRecipients(account.instance!, kind))
    )
  );
  const recipients = recipientsALL.flat();
  info("PRONOTE->createDiscussionRecipients(): OK", "pronote");
  return recipients.map((recipient) => ({
    name: recipient.name,
    subject: recipient.subjects.length > 0
      ? recipient.subjects.map(subject => subject.name).join(", ")
      : undefined,
    _handle: recipient
  }));
};

export const createDiscussion = async (account: PronoteAccount, subject: string, content: string, recipients: Recipient[]): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.newDiscussion(account.instance, subject, content, recipients.map(r => r._handle));
  info("PRONOTE->createDiscussion(): OK", "pronote");
};
