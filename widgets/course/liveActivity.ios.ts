import { createMMKV } from "react-native-mmkv";

import type { Course as SharedCourse } from "@/services/shared/timetable";
import { warn } from "@/utils/logger/logger";
import { f } from "@/utils/theme/fonts";

import type { WidgetFonts } from "../theme";
import { CourseLiveActivity } from "./CourseLiveActivity";
import {
  buildCourseLiveActivityProps,
  type CourseLiveActivityPreviewMode,
  type CourseLiveActivityProps
} from "./content";
import { selectLiveActivityCourse } from "./selection";

export const COURSE_LIVE_ACTIVITY_SUPPORTED: boolean = true;

const storage = createMMKV({ id: "course-live-activity" });

const TRACKED_KEY = "tracked";

type TrackedActivity = {
  activityId: string;
  courseId: string;
  preview: boolean;
};

const readTracked = (): TrackedActivity | null => {
  const raw = storage.getString(TRACKED_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TrackedActivity;
  } catch {
    storage.remove(TRACKED_KEY);
    return null;
  }
};

const writeTracked = (tracked: TrackedActivity) =>
  storage.set(TRACKED_KEY, JSON.stringify(tracked));

const currentFonts = (): WidgetFonts => ({
  regular: f("regular"),
  medium: f("medium"),
  semibold: f("semibold"),
  bold: f("bold")
});

// ActivityKit re-renders an activity once it goes stale: that moment is what
// moves the layout from "about to start" to "under way" with the app closed.
const staleDate = (props: CourseLiveActivityProps, at: Date) =>
  new Date(at.getTime() < props.startsAt ? props.startsAt : props.endsAt);

const applyPresentation = async (
  props: CourseLiveActivityProps | null,
  options: { preview: boolean; at: Date }
) => {
  const tracked = readTracked();
  const instances = CourseLiveActivity.getInstances();
  const current = instances.find((instance) => instance.getId() === tracked?.activityId);

  for (const instance of instances) {
    if (instance.getId() !== current?.getId()) {
      await instance.end("immediate");
    }
  }

  if (!props) {
    if (current) {
      await current.end("immediate");
    }
    storage.remove(TRACKED_KEY);
    return;
  }

  if (current && tracked?.courseId === props.courseId) {
    await current.update(props, staleDate(props, options.at));
    writeTracked({
      activityId: tracked.activityId,
      courseId: props.courseId,
      preview: options.preview
    });
    return;
  }

  if (current) {
    await current.end("immediate");
  }

  const activity = CourseLiveActivity.start(
    props,
    `papillon:///course/${props.courseId}`,
    staleDate(props, options.at)
  );

  writeTracked({
    activityId: activity.getId(),
    courseId: props.courseId,
    preview: options.preview
  });
};

// Presentations run one at a time: a foreground sync and a transition landing
// together would otherwise both read "nothing running yet" and start an activity.
let pending: Promise<void> = Promise.resolve();

const present = (
  props: CourseLiveActivityProps | null,
  options: { preview: boolean; at: Date }
): Promise<void> => {
  const work = () => applyPresentation(props, options);
  pending = pending.then(work, work);
  return pending;
};

export const syncCourseLiveActivity = async (
  courses: SharedCourse[],
  options: { at?: Date; testMode?: boolean; enabled?: boolean } = {}
): Promise<void> => {
  const at = options.at ?? new Date();

  if (options.testMode) {
    return;
  }

  try {
    if (readTracked()?.preview) {
      await present(null, { preview: false, at });
    }

    const course =
      options.enabled === false ? null : selectLiveActivityCourse(courses, at);

    await present(
      course ? buildCourseLiveActivityProps(course, currentFonts(), at) : null,
      { preview: false, at }
    );
  } catch (error) {
    warn(`Course live activity sync failed: ${error}`);
  }
};

const PREVIEW_ELAPSED_MS = 5 * 60 * 1000;

const PREVIEW_LEAD_MS = 15 * 60 * 1000;

const PREVIEW_FALLBACK_DURATION_MS = 55 * 60 * 1000;

export const previewCourseLiveActivity = async (
  course: SharedCourse,
  mode: CourseLiveActivityPreviewMode
): Promise<void> => {
  const at = new Date();
  const scheduled = course.to.getTime() - course.from.getTime();
  const duration = scheduled > 0 ? scheduled : PREVIEW_FALLBACK_DURATION_MS;

  const from = new Date(
    mode === "ongoing" ? at.getTime() - PREVIEW_ELAPSED_MS : at.getTime() + PREVIEW_LEAD_MS
  );

  await present(
    buildCourseLiveActivityProps(course, currentFonts(), at, {
      from,
      to: new Date(from.getTime() + duration)
    }),
    { preview: true, at }
  );
};

export const stopCourseLiveActivity = async (): Promise<void> => {
  try {
    await present(null, { preview: false, at: new Date() });
  } catch (error) {
    warn(`Course live activity could not be stopped: ${error}`);
  }
};
