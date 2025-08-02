import { Lesson, Skolengo } from "skolengojs";
import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";
import { getWeekRangeForDate } from "@/database/useCanteen";

export async function fetchSkolengoTimetable(session: Skolengo, accountId: string, date: Date): Promise<CourseDay[]> {
	const { start, end } = getWeekRangeForDate(date)
	const timetable = await session.GetTimetable(start, end)
	return timetable.map(day => ({
		date: day.date,
		courses: mapSkolengoCourse(day.lessons, accountId)
	}));
}

function mapSkolengoCourse(data: Lesson[], accountId: string): Course[] {
	return data.map(lesson => ({
		subject: lesson.subject.label,
		id: lesson.id,
		type: CourseType.LESSON,
		from: lesson.startDateTime,
		to: lesson.endDateTime,
		room: lesson.room,
		teacher: lesson.teacher.map(t => `${t.firstName} ${t.lastName}`).join(", "),
		backgroundColor: lesson.subject.color,
		status: lesson.canceled ? CourseStatus.CANCELED : undefined,
		createdByAccount: accountId
	}))
}