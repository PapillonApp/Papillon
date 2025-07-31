import {Attachment as SkolengoAttachment} from "scolengo-api/types/models/School";
import { AttachmentType, type Attachment } from "../../shared/Attachment";

export function decodeSkoAttachment (a: SkolengoAttachment): Attachment {
  return {
    name: a.name || "Devoir inconnu",
    url: a.url,
    type: AttachmentType.File
  };
}