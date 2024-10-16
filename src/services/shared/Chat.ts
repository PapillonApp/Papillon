import type { Attachment } from "./Attachment";

export interface Chat {
  id: string
  subject: string
  recipient: string
  creator: string
  read: boolean
  /**
   * Link to the original instance.
   * You can also not use it, it all depends on the service
   * you're implementing.
   *
   * **Should only be used internally, not in the front-end.**
   */
  _handle?: any
}

export interface ChatMessage {
  id: string
  content: string
  author: string
  subject: string
  date: Date
  attachments: Attachment[]
}