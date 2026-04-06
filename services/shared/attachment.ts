import { GenericInterface } from "@/services/shared/types";

/**
 *
 * Represents an attachment used in homework or other contexts.
 * @property {AttachmentType} type - The type of the attachment (file or link).
 * @property {string} name - The name of the attachment.
 * @property {string} url - The URL or path to the attachment.
 */
export interface Attachment extends GenericInterface {
  type: AttachmentType;
  name: string;
  url: string;
  metadata?: AttachmentMetadata;
}

export interface AttachmentMetadata {
  provider?: string;
  role?: "subject" | "correction";
  reference?: string;
  fileType?: string;
  downloadParams?: Record<string, string | number | boolean>;
}

export enum AttachmentType {
  LINK,
  FILE
}
