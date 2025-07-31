import type { Attachment } from "./Attachment";

export enum HomeworkReturnType {
  Paper = "paper",
  FileUpload = "file_upload",
}

export interface Homework {
  /** id of the homework for the given service. */
  id: string
  subject: string
  attachments: Attachment[]
  color: string
  /** As HTML. */
  content: string
  due: number
  done: boolean
  returnType?: HomeworkReturnType
  exam?: boolean
  personalizate: boolean
}