import { Grade as SkolengoGrade, Skolengo, Subject as SkolengoSubjects, Kind } from "skolengojs";
import { Grade, GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchSkolengoGradesForPeriod(session: Skolengo, accountId: string, period: string): Promise<PeriodGrades> {
	const subjects = await session.GetGradesForPeriod(period)
	const studentOverall: GradeScore = {
		value: subjects.reduce((sum, subject) => sum + subject.value, 0) / subjects.length,
		disabled: false
	}
	const classAverage: GradeScore = {
		value: subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length,
		disabled: false
	}

	return {
		createdByAccount: accountId,
		studentOverall,
		classAverage,
		subjects: mapSkolengoSubjects(subjects, accountId)
	}
}

export async function fetchSkolengoGradePeriods(session: Skolengo, accountId: string): Promise<Period[]> {
	const result: Period[] = []
	
	if (session.kind === Kind.STUDENT) {
		const periods = (await session.GetGradesSettings()).periods
		for (const period of periods) {
			result.push({
				name: period.label,
				id: period.id,
				start: period.startDate,
				end: period.endDate,
				createdByAccount: accountId
			})
		}
	} else {
		for (const kid of session.kids ?? []) {
			const periods = (await kid.GetGradesSettings()).periods
			for (const period of periods) {
				result.push({
					name: period.label,
					id: period.id,
					start: period.startDate,
					end: period.endDate,
					createdByAccount: accountId,
					kidName: `${kid.firstName} ${kid.lastName}`
				})
			}		
		}
	}
	return result
}

function mapSkolengoGrades(grades: SkolengoGrade[], accountId: string): Grade[] {
	return grades.map(grade => ({
		id: grade.id,
		subjectId: grade.subject?.id ?? "",
		description: grade.title ?? "",
		givenAt: grade.date,
		outOf: { value: grade.outOf },
		coefficient: grade.coefficient,
		studentScore: { value: grade.value, disabled: !grade.isGraded, status: grade.notGradedReason },
		createdByAccount: accountId
	}))
}

function mapSkolengoSubjects(subjects: SkolengoSubjects[], accountId: string): Subject[] {
	return subjects.map(subject => ({
		id: subject.id,
		name: subject.name,
		classAverage: { value: subject.average },
		studentAverage: { value: subject.value },
		outOf: { value: subject.outOf },
		grades: mapSkolengoGrades(subject.grades, accountId)
	}))
}
