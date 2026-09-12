import type { Course as SharedCourse } from "@/services/shared/timetable";

import type { CourseLiveActivityPreviewMode } from "./content";

export const COURSE_LIVE_ACTIVITY_SUPPORTED: boolean = false;

export const syncCourseLiveActivity = async (
  _courses: SharedCourse[],
  _options: { at?: Date; testMode?: boolean; enabled?: boolean } = {}
): Promise<void> => undefined;

export const previewCourseLiveActivity = async (
  _course: SharedCourse,
  _mode: CourseLiveActivityPreviewMode
): Promise<void> => undefined;

export const stopCourseLiveActivity = async (): Promise<void> => undefined;
