import ecoledirecte from "pawdirecte";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import type { Chat, ChatMessage } from "../shared/Chat";

export const getChats = async (account: EcoleDirecteAccount): Promise<Chat[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const chats = await ecoledirecte.studentReceivedMessages(account.authentication.session, account.authentication.account);

  return chats.chats.map((chat) => ({
    id: chat.id.toString(),
    subject: chat.subject,
    recipient: account.name,
    creator: chat.sender,
    read: chat.read,
    date: chat.date
  }));
};

const cleanMessage = (message: string) => {
  return message.replace(/>\s+/g, ">").replace(/&nbsp;/g, " ");
};

export const getChatMessages = async (account: EcoleDirecteAccount, chat: Chat): Promise<ChatMessage> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const message = await ecoledirecte.readMessage(account.authentication.session, account.authentication.account, Number(chat.id));

  return {
    id: message.id.toString(),
    content: cleanMessage(message.content),
    author: message.sender,
    date: message.date,
    subject: chat.subject,
    //@ts-ignore
    attachments: message.files.map((a) => ({
      type: "file", // no links as attachements in ed
      name: a.name,
      url: `${a.name}\\${a.id}\\${a.type}`
    }))
  };
};
