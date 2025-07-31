import pronote from "pawnote";
import { AttachmentType, type Attachment } from "../shared/Attachment";

export function decodeAttachment (a: pronote.Attachment): Attachment {
  return {
    name: a.name,
    url: a.url,
    type: a.kind === pronote.AttachmentKind.File ? AttachmentType.File : AttachmentType.Link
  };
}