import { type Account, AccountService } from "@/stores/account/types";
import type { Chat, ChatMessage } from "./shared/Chat";
import type { Recipient } from "./shared/Recipient";

export const getChats = async <T extends Account> (account: T): Promise<Array<Chat>> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChats } = await import("./pronote/chats");
      return getChats(account);
    }
    case AccountService.EcoleDirecte: {
      const {getChats} = await import("./ecoledirecte/chats");
      return await getChats(account);
    }
    default:
      console.info(`[getChats]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const getChatMessages = async <T extends Account> (account: T, chat: Chat): Promise<ChatMessage> => {
  switch (account.service) {
    case AccountService.EcoleDirecte: {
      const { getChatMessages } = await import("./ecoledirecte/chats");
      return await getChatMessages(account, chat);
    }
    default:
      console.info(`[getChatMessages]: returning empty since ${account.service} not implemented.`);
      return {};
  }
};

export const createDiscussionRecipients = async <T extends Account> (account: T): Promise<Recipient[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { createDiscussionRecipients } = await import("./pronote/chats");
      return createDiscussionRecipients(account);
    }
    default:
      console.info(`[createDiscussionRecipients]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const createDiscussion = async <T extends Account> (account: T, subject: string, content: string, recipients: Recipient[]): Promise<void> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { createDiscussion } = await import("./pronote/chats");
      createDiscussion(account, subject, content, recipients);
      break;
    }
    default:
      console.info(`[createDiscussion]: doing nothing since ${account.service} is not implemented.`);
  }
};