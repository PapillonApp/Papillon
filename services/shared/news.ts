import { GenericInterface } from "@/services/shared/types";
import { Attachment} from "@/services/shared/attachment";

export interface News extends GenericInterface {
  id: string;
  title?: string;
  createdAt: Date;
  acknowledged: boolean;
  attachments: Array<Attachment>;
  content: string;
  author: string;
  category: string;
}