import { Attachment } from "@/services/shared/attachment";
import { GenericInterface } from "@/services/shared/types";

export interface CourseDay {
  date: Date;
  courses: Course[];
}

export interface Course extends GenericInterface {
  subject: string;
  id: string;
  type: CourseType;
  from: Date;
  to: Date;
  additionalInfo?: string;
  room?: string;
  teacher?: string;
  group?: string;
  backgroundColor?: string;
  status?: CourseStatus;
  customStatus?: string;
  url?: string;
  resourceId?: string;
}

export interface CourseResource {
  title?: string;
  description?: string;
  category: number;
  attachments: Attachment[]
}

export enum CourseType {
  LESSON,
  ACTIVITY,
  DETENTION,
  VACATION
}

export enum CourseStatus {
  CANCELED,
  EDITED,
  ONLINE,
  EVALUATED
}