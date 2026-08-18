import Foundation
import SQLite3

enum PapillonDataStore {
    static func courses(createdByAccounts: Set<String>, ids: Set<String>? = nil) throws -> [PapillonCourse] {
        let deleted = try deletedRowIds(table: "courses")

        return try Courses.fetchAll()
            .filter { createdByAccounts.contains($0.createdByAccount) && !deleted.contains($0.id) }
            .filter { ids == nil || ids!.contains($0.courseId) }
            .map { course in
                PapillonCourse(
                    id: course.courseId,
                    subject: course.subject,
                    from: Date(msSince1970: course.from),
                    to: Date(msSince1970: course.to),
                    room: course.room,
                    teacher: course.teacher,
                    isCanceled: course.status == 0
                )
            }
    }

    static func homework(createdByAccounts: Set<String>, ids: Set<String>? = nil) throws -> [PapillonHomework] {
        let deleted = try deletedRowIds(table: "homework")

        return try Homework.fetchAll()
            .filter { createdByAccounts.contains($0.createdByAccount) && !deleted.contains($0.id) }
            .filter { ids == nil || ids!.contains($0.homeworkId) }
            .map { homework in
                PapillonHomework(
                    id: homework.homeworkId,
                    subject: homework.subject,
                    content: homework.content.strippingHTMLTags(),
                    dueDate: Date(msSince1970: homework.dueDate),
                    isDone: homework.isDone,
                    isEvaluation: homework.evaluation
                )
            }
    }

    static func grades(createdByAccounts: Set<String>, ids: Set<String>? = nil) throws -> [PapillonGrade] {
        let deleted = try deletedRowIds(table: "grades")

        return try Grades.fetchAll()
            .filter { createdByAccounts.contains($0.createdByAccount) && !deleted.contains($0.id) }
            .filter { ids == nil || ids!.contains($0.gradeId) }
            .map { grade in
                PapillonGrade(
                    id: grade.gradeId,
                    subjectName: grade.subjectName,
                    gradeDescription: grade.description,
                    givenAt: Date(msSince1970: grade.givenAt),
                    studentScore: gradeScoreValue(grade.studentScore),
                    outOf: gradeScoreValue(grade.outOf)
                )
            }
    }

    private static func deletedRowIds(table: String) throws -> Set<String> {
        let db = NativeDB.shared
        let statement = try db.query("SELECT id FROM \(table) WHERE \"_status\" = 'deleted'")
        defer { db.freeQuery(statement) }

        var ids: Set<String> = []
        while sqlite3_step(statement) == SQLITE_ROW {
            if let cString = sqlite3_column_text(statement, 0) {
                ids.insert(String(cString: cString))
            }
        }
        return ids
    }

    private static func gradeScoreValue(_ json: String) -> Double? {
        guard let data = json.data(using: .utf8) else { return nil }
        guard let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        if let value = object["value"] as? Double { return value }
        if let value = object["value"] as? Int { return Double(value) }
        return nil
    }
}

private extension Date {
    init(msSince1970: Int) {
        self.init(timeIntervalSince1970: Double(msSince1970) / 1000)
    }
}
