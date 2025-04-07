import { type Account, AccountService } from "@/stores/account/types";
import type { Chat, ChatMessage, ChatRecipient } from "./shared/Chat";
import type { Recipient } from "./shared/Recipient";
import { getFeatureAccount } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { info, log } from "@/utils/logger/logger";

export const getChats = async <T extends Account> (account: T): Promise<Array<Chat>> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChats } = await import("./pronote/chats");
      return getChats(account);
    }
    case AccountService.EcoleDirecte: {
      const { getChats } = await import("./ecoledirecte/chats");
      return await getChats(account);
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        return [];
      }
      return await getChats(service);
    }
    default:
      info(`Returning empty since ${account.service} not implemented.`, "getChats");
      return [];
  }
};

export const getChatRecipients = async <T extends Account> (account: T, chat: Chat): Promise<ChatRecipient[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChatRecipients } = await import("./pronote/chats");
      return await getChatRecipients(account, chat);
    }
    case AccountService.EcoleDirecte: {
      // TODO
      return [{
        id: account.localID,
        name: account.name,
        class: null
      },
      {
        id: chat.creator,
        name: chat.creator,
        class: null
      }];
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        return [];
      }
      return await getChatRecipients(service, chat);
    }
    default:
      info(`Returning empty since ${account.service} not implemented.`, "getChatRecipients");
      return [];
  }
};

export const sendMessageInChat = async <T extends Account> (account: T, chat: Chat, content: string): Promise<void> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { sendMessageInChat } = await import("./pronote/chats");
      await sendMessageInChat(account, chat, content);
      break;
    }
    case AccountService.EcoleDirecte: {
      // TODO
      break;
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        break;
      }
      return await sendMessageInChat(service, chat, content);
    }
    default:
      info("Not Implementend.", "sendMessageInChat");
  }
};

export const getChatMessages = async <T extends Account> (account: T, chat: Chat): Promise<ChatMessage[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChatMessages } = await import("./pronote/chats");
      return await getChatMessages(account, chat);
    }
    case AccountService.EcoleDirecte: {
      const { getChatMessages } = await import("./ecoledirecte/chats");
      return [await getChatMessages(account, chat)];
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        return [];
      }
      return await getChatMessages(service, chat);
    }
    default:
      info(`Returning empty since ${account.service} not implemented.`, "getChatMessages");
      return [];
  }
};

export const createDiscussionRecipients = async <T extends Account> (account: T): Promise<Recipient[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { createDiscussionRecipients } = await import("./pronote/chats");
      return createDiscussionRecipients(account);
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        return [];
      }
      return await createDiscussionRecipients(service);
    }
    default:
      info(`Returning empty since ${account.service} not implemented.`, "createDiscussionRecipients");
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
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Chats, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Chats\"", "multiservice");
        break;
      }
      return await createDiscussion(service, subject, content, recipients);
    }
    default:
      info(`Doing nothing since ${account.service} is not implemented.`, "createDiscussion");
  }
};
