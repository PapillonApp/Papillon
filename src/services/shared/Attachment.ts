export enum AttachmentType {
  File = "file",
  Link = "link"
}

export interface Attachment {
  type: AttachmentType
  name: string
  url: string
}