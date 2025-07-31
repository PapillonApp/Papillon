import pronote from "pawnote";
import { AttachmentType } from "../shared/Attachment";
export function decodeAttachment(a) {
    return {
        name: a.name,
        url: a.url,
        type: a.kind === pronote.AttachmentKind.File ? AttachmentType.File : AttachmentType.Link
    };
}
