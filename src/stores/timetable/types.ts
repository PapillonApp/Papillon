import type { Timetable } from "@/services/shared/Timetable";

export interface TimetableStore {
  timetables: Record<number, Timetable>,
  updateClasses: (epochWeekNumber: number, classes: Timetable) => void,
  injectClasses: (data: any) => void,
  removeClasses: (epochWeekNumber: number) => void,
  removeClassesFromSource: (source: string) => void
}

