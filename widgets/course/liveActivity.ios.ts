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

// Which activity we started and for which course. ActivityKit hands back the
// activities that outlived the app, but not what they were about, so the link
// between the two has to survive on our side.
const storage = createMMKV({ id: "course-live-activity" });

const TRACKED_KEY = "tracked";

type TrackedActivity = {
  activityId: string;
  courseId: string;
  /** Started by hand from the dev trigger, so the timetable does not own it. */
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

/**
 * The moment the content stops being the whole truth: the start of the course
 * while it is still ahead, its end once it is running. The layout reads the
 * clock itself, and ActivityKit re-renders an activity when it goes stale — so
 * this is what moves it from "about to start" to "under way" with the app
 * closed.
 */
const staleDate = (props: CourseLiveActivityProps, at: Date) =>
  new Date(at.getTime() < props.startsAt ? props.startsAt : props.endsAt);

/**
 * Brings what is on screen in line with `props`: one activity for that course,
 * and nothing else. `null` leaves the user with none.
 */
const applyPresentation = async (
  props: CourseLiveActivityProps | null,
  options: { preview: boolean; at: Date }
) => {
  const tracked = readTracked();
  const instances = CourseLiveActivity.getInstances();
  const current = instances.find((instance) => instance.getId() === tracked?.activityId);

  // Anything we are not tracking is a leftover — a crash, or a build that
  // started it under different content. There is nothing of ours to keep in it.
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
// together would otherwise both read "nothing running yet" and start an
// activity of their own.
let pending: Promise<void> = Promise.resolve();

const present = (
  props: CourseLiveActivityProps | null,
  options: { preview: boolean; at: Date }
): Promise<void> => {
  const work = () => applyPresentation(props, options);
  pending = pending.then(work, work);
  return pending;
};

/**
 * Puts the course being taught right now — or the one about to start — on the
 * Lock Screen, and takes down whatever no longer applies. Safe to call as often
 * as needed: it only ever ends up with the one activity the timetable calls for.
 */
export const syncCourseLiveActivity = async (
  courses: SharedCourse[],
  options: { at?: Date; testMode?: boolean; enabled?: boolean } = {}
): Promise<void> => {
  const at = options.at ?? new Date();

  // While the test mode is on, the dev trigger owns the activity: the timetable
  // must not take down what was just started by hand.
  if (options.testMode) {
    return;
  }

  try {
    // A preview left over from a test session is not tied to the timetable, so
    // it goes even when it happens to be about the same course.
    if (readTracked()?.preview) {
      await present(null, { preview: false, at });
    }

    // Turned off in the settings, the sync still runs: it is what takes down
    // the activity that was already on screen when the switch was flipped.
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

/** Five minutes in, for the "under way" preview. */
const PREVIEW_ELAPSED_MS = 5 * 60 * 1000;

/** A quarter of an hour out, for the "about to start" preview. */
const PREVIEW_LEAD_MS = 15 * 60 * 1000;

const PREVIEW_FALLBACK_DURATION_MS = 55 * 60 * 1000;

/**
 * Starts the activity for a course by hand, with its hours moved around the
 * present so both states can be seen on demand. Throws so the dev screen can
 * show why ActivityKit turned it down.
 */
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
