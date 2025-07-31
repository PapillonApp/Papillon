import { AttachmentType } from "../../shared/Attachment";
export function decodeSkoAttachment(a) {
    return {
        name: a.name || "Devoir inconnu",
        url: a.url,
        type: AttachmentType.File
    };
}
