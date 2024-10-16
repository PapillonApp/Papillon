import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { ClassSubjectStore } from "./types";

export const useClassSubjectStore = create<ClassSubjectStore>()(
  persist(
    (set) => ({
      subjects: [],
      pushSubjects (newSubjects) {
        set((state) => ({
          subjects: [
            ...state.subjects.filter(
              (subject) => !newSubjects.some((newSubject) => newSubject.id === subject.id)
            ),
            ...newSubjects,
          ],
        }));
      },
    }),
    {
      name: "<default>-subjects-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);