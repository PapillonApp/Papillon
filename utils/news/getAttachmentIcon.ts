import { Attachment } from "@/services/shared/attachment";

export const getAttachmentIcon = (attachment: Attachment) => {
  if(attachment.type === 0) {
    return "link"
  }

  if(attachment.name.endsWith(".png") || attachment.name.endsWith(".jpg") || attachment.name.endsWith(".jpeg") || attachment.name.endsWith(".gif") || attachment.name.endsWith(".webp")) {
    return "gallery"
  }

  return "paper"
}