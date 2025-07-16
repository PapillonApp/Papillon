export interface Attachment {
  type: AttachmentType;
  name: string;
  url: string;
}

export enum AttachmentType {
  FILE,
  LINK
}