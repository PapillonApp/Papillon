import { PapillonMultiServiceSpace, PrimaryAccount } from "@/stores/account/types";

export enum MultiServiceFeature {
  Grades = "grades",
  Timetable = "timetable",
  Homeworks = "homeworks",
  Attendance = "attendance",
  News = "news",
  Evaluations = "evaluations",
  Chats = "chats"
}

export interface MultiServiceSpace {
  accountLocalID: string
  name: string
  image?: string
  /*
   Each feature returns its linked account localID
   */
  featuresServices: {
    [key in MultiServiceFeature]?: string
  }
}

export interface MultiServiceStore {
  enabled?: boolean
  spaces: MultiServiceSpace[]
  create: (space: MultiServiceSpace, linkAccount: PapillonMultiServiceSpace) => void
  remove: (localID: string) => void
  update: <A extends MultiServiceSpace, T extends keyof A = keyof A>(localID: string, key: T, value: A[T]) => void
  toggleEnabledState: () => void
  setFeatureAccount: (spaceLocalID: string, feature: MultiServiceFeature, account: PrimaryAccount | undefined) => void
  getFeatureAccountId: (feature: MultiServiceFeature, spaceLocalID: string) => string | undefined
}
