export interface TimetableClass {
  subject: string
  id: number | string
  type: "lesson" | "activity" | "detention" | "vacation"
  title: string,
  itemType?: string,
  startTimestamp: number
  endTimestamp: number
  additionalNotes?: string
  building?: string
  room?: string
  teacher?: string
  group?: string
  backgroundColor?: string,
  status?: TimetableClassStatus,
  statusText?: string,
  source?: string
  url?: string,
  ressourceID?: string
}

export interface TimetableRessource {
  title?: string,
  description?: string,
  category?: string,
  files?: Array<{
    name: string,
    url: string
  }>
}

export type Timetable = Array<TimetableClass>;

export enum TimetableClassStatus {
  CANCELED = "Annulé",
  MODIFIED = "Modifié",
  ONLINE = "En ligne",
  TEST = "ds",
}

export interface WeekFrequency {
  textLabel: string,
  freqLabel: string,
  num: number
}