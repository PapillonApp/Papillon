import {
  discussionMessages,
  discussionRecipients,
  discussions,
  discussionSendMessage,
  EntityKind, newDiscussionRecipients,
  SessionHandle,
  TabLocation,
} from "pawnote";
import { error } from "@/utils/logger/logger";
import { Chat, Message, Recipient } from "@/services/shared/chat";

export async function fetchPronoteChats(
  session: SessionHandle,
  accountId: string
): Promise<Chat[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteChats");
  }

  const chatTab = session.user.resources[0].tabs.get(TabLocation.Discussions);
  if (!chatTab) {
    error("Chat tab not found in session", "fetchPronoteChats");
  }

  const chats = await discussions(session);
  return chats.items.map(chat => ({
    id: chat.participantsMessageID,
    subject: chat.subject,
    creator: chat.creator,
    recipient: chat.recipientName,
    date: chat.date,
    ref: chat,
    createdByAccount: accountId,
  }));
}

export async function fetchPronoteChatRecipients(
  session: SessionHandle,
  chat: Chat
): Promise<Recipient[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteChatRecipients");
  }

  const chatTab = session.user.resources[0].tabs.get(TabLocation.Discussions);
  if (!chatTab) {
    error("Chat tab not found in session", "fetchPronoteChatRecipients");
  }

  if (!chat.ref) {
    error("Chat reference is undefined", "fetchPronoteChatRecipients");
  }

  const recipients = await discussionRecipients(session, chat.ref);
  return recipients.map((recipient) => {
    const [namePart, classPart] = recipient.name.split("(");

    return {
      id: recipient.id,
      name: namePart.trim(),
      class: classPart ? classPart.replace(")", "").trim() : undefined
    };
  });
}

export async function fetchPronoteChatMessages(
  session: SessionHandle,
  accountId: string,
  chat: Chat
): Promise<Message[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteChatMessages");
  }

  const chatTab = session.user.resources[0].tabs.get(TabLocation.Discussions);
  if (!chatTab) {
    error("Chat tab not found in session", "fetchPronoteChatMessages");
  }

  if (!chat.ref) {
    error("Chat reference is undefined", "fetchPronoteChatMessages");
  }

  const messages = await discussionMessages(session, chat.ref, true)
  const studentName = session.user.resources[0].name;

  return messages.sents.map((message) => {
    return {
      id: message.id,
      subject: "",
      content: message.content,
      author: message.author?.name ?? studentName,
      date: message.creationDate,
      attachments: message.files.map((attachment) => ({
        type: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        createdByAccount: accountId,
      }))
    };
  });
}

export async function sendPronoteMessageInChat(
  session: SessionHandle,
  chat: Chat,
  content: string
): Promise<void> {
  if (!session) {
    error("Session is undefined", "fetchPronoteChatMessages");
  }

  const chatTab = session.user.resources[0].tabs.get(TabLocation.Discussions);
  if (!chatTab) {
    error("Chat tab not found in session", "fetchPronoteChatMessages");
  }

  if (!chat.ref) {
    error("Chat reference is undefined", "fetchPronoteChatMessages");
  }

  await discussionSendMessage(session, chat.ref, content)
}

export async function fetchPronoteRecipients(
  session: SessionHandle,
): Promise<Recipient[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteChatMessages");
  }

  const chatTab = session.user.resources[0].tabs.get(TabLocation.Discussions);
  if (!chatTab) {
    error("Chat tab not found in session", "fetchPronoteChatMessages");
  }

  const alLRecipients = await Promise.all(
    session.user.resources.flatMap(resource =>
      [
        EntityKind.Teacher,
        EntityKind.Personal
      ].map(kind => newDiscussionRecipients(session, kind))
    )
  );

  const recipients = alLRecipients.flat();

  return recipients.map((recipient) => {
    const [namePart, classPart] = recipient.name.split("(");

    return {
      id: recipient.id,
      name: namePart.trim(),
      class: classPart ? classPart.replace(")", "").trim() : undefined,
      ref: recipient
    };
  });
}