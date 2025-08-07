import { Discussion, NewDiscussionRecipient } from "pawnote";
import { Mail, Recipients } from "skolengojs";

import { Attachment } from "@/services/shared/attachment";
import { GenericInterface } from "@/services/shared/types";

export interface Chat extends GenericInterface {
  id: string;
  subject: string;
  recipient?: string;
  creator?: string;
  date: Date;
  ref?: Discussion | Mail;
}

export interface Recipient {
  id: string;
  name: string;
  class?: string;
  ref?: NewDiscussionRecipient | Recipients
}

export interface Message {
  id: string;
  content: string;
  author: string;
  subject: string;
  date: Date;
  attachments: Attachment[]
}