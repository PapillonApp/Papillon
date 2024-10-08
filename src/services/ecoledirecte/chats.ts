import ecoledirecte from "pawdirecte";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import type { Chat, ChatMessage } from "../shared/Chat";

export const getChats = async (account: EcoleDirecteAccount): Promise<Chat[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const chats = await ecoledirecte.studentReceivedMessages(account.authentication.session, account.authentication.account);

  return chats.map((chat) => ({
    id: chat.id.toString(),
    subject: chat.subject,
    recipient: chat.sender,
    creator: chat.sender,
  }));
};

export const getChatMessages = async (account: EcoleDirecteAccount, chat: Chat): Promise<ChatMessage> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const message = await ecoledirecte.readMessage(account.authentication.session, account.authentication.account, Number(chat.id));

  return {
    id: message.id.toString(),
    content: message.content,
    author: message.sender,
    date: message.date,
    subject: chat.subject,
    //@ts-ignore
    attachments: message.files.map((a) => ({
      type: a.type,
      name: a.name,
      url: ""
    }))
  };
};
