import { GenericInterface } from "@/services/shared/types";
import { Attachment } from "@/services/shared/attachment";
import { Discussion, NewDiscussionRecipient } from "pawnote";

export interface Chat extends GenericInterface {
  id: string;
  subject: string;
  recipient?: string;
  creator?: string;
  date: Date;
  ref?: Discussion;
}

export interface Recipient {
  id: string;
  name: string;
  class?: string;
  ref?: NewDiscussionRecipient
}

export interface Message {
  id: string;
  content: string;
  author: string;
  subject: string;
  date: Date;
  attachments: Attachment[]
}