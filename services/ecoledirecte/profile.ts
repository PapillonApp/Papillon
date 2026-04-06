import { Client } from "@blockshub/blocksdirecte";
import { Buffer } from "buffer";

import { createProfilePictureDataUri } from "@/utils/profilePicture";

type ProfilePhotoResponse = {
  data: ArrayBuffer;
  contentType?: string;
};

export async function fetchEDProfilePicture(session: Client): Promise<string | undefined> {
  const downloader = session.downloader as typeof session.downloader & {
    getProfilePhoto: () => Promise<ProfilePhotoResponse | null>;
  };

  const response = await downloader.getProfilePhoto();
  if (!response) {
    return undefined;
  }

  const base64 = Buffer.from(new Uint8Array(response.data)).toString("base64");
  if (!base64) {
    return undefined;
  }

  return createProfilePictureDataUri(base64, response.contentType);
}
