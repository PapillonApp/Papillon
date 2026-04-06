import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

import { isEDAttachment, openEDAttachment } from "@/services/ecoledirecte/attachments";
import { Attachment, AttachmentType } from "@/services/shared/attachment";

export async function openAttachment(attachment: Attachment): Promise<void> {
  if (isEDAttachment(attachment)) {
    await openEDAttachment(attachment);
    return;
  }

  if (attachment.type === AttachmentType.LINK) {
    await Linking.openURL(attachment.url);
    return;
  }

  await WebBrowser.openBrowserAsync(attachment.url, {
    presentationStyle: "formSheet",
  });
}
