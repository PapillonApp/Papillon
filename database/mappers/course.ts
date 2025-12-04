import { Course as SharedCourse } from "@/services/shared/timetable";
import { adjustToDeviceTimeZone } from "@/utils/date";

import Course from "../models/Timetable";

export function mapCourseToShared(course: Course): SharedCourse {
  return {
    subject: course.subject,
    id: course.id,
    fromCache: true,
    createdByAccount: course.createdByAccount,
    type: course.type,
    from: adjustToDeviceTimeZone(new Date(course.from)),
    to: adjustToDeviceTimeZone(new Date(course.to)),
    additionalInfo: course.additionalInfo,
    room: course.room,
    teacher: course.teacher,
    group: course.group,
    backgroundColor: course.backgroundColor,
    status: course.status,
    customStatus: course.customStatus,
    url: course.url,
    kidName: course.kidName
  }
}