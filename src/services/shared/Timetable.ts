export interface TimetableClass {
  subject: string
  id: number|string
  type: "lesson" | "activity" | "detention"
  title: string,
  itemType?: string,
  startTimestamp: number
  endTimestamp: number
  additionalNotes?: string
  room?: string
  teacher?: string
  backgroundColor?: string,
  status?: TimetableClassStatus,
  statusText?: string,
  source?: string
}

export type Timetable = Array<TimetableClass>;

export enum TimetableClassStatus {
  CANCELED = "canceled",
  TEST = "ds",
}