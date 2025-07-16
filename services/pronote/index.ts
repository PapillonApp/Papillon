import { AccountKind, assignmentsFromWeek,createSessionHandle, loginToken } from "pawnote";

import { Homework, ReturnFormat } from "@/services/shared/homework";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;
  capabilities = [Capabilities.HOMEWORK, Capabilities.GRADES];
  session = undefined;
  authData: Auth = {};

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<Pronote> {
    const handle = createSessionHandle();
    const auth = await loginToken(handle, {
      url: String(credentials.additionals?.["instanceURL"] || ""),
      kind:
        (credentials.additionals?.["kind"] as AccountKind) ||
        AccountKind.STUDENT,
      username: String(credentials.additionals?.["username"] || ""),
      token: String(credentials.refreshToken ?? ""),
      deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
    });

    this.authData = {
      accessToken: auth.token,
      refreshToken: auth.token,
      additionals: {
        instanceURL: auth.url,
        kind: auth.kind,
        username: auth.username,
        deviceUUID: String(credentials.additionals?.["deviceUUID"] || ""),
      },
    };

    return this;
  }

  async getHomeworks(): Promise<Array<Homework>> {
    const result: Homework[] = [];

    if (this.session) {
      const homeworks = await assignmentsFromWeek(this.session, 1, 4);
      for (const homework of homeworks) {
        result.push({
          id: homework.id,
          subject: homework.subject.name,
          content: homework.description,
          dueDate: homework.deadline,
          isDone: homework.done,
          returnFormat: homework.return.kind === 1 ? ReturnFormat.PAPER : ReturnFormat.FILE_UPLOAD,
          attachments: homework.attachments.map((attachment) => ({
            type: attachment.kind,
            name: attachment.name,
            url: attachment.url,
            createdByAccount: this.accountId
          })),
          evaluation: false,
          custom: false,
          createdByAccount: this.accountId
        });
      }
    }
    return []
  }
}
