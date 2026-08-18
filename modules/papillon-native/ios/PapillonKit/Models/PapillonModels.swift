import Foundation

public struct PapillonCourse: Sendable, Identifiable, Hashable {
    public let id: String
    public let subject: String
    public let from: Date
    public let to: Date
    public let room: String?
    public let teacher: String?
    public let isCanceled: Bool

    public init(id: String, subject: String, from: Date, to: Date, room: String?, teacher: String?, isCanceled: Bool) {
        self.id = id
        self.subject = subject
        self.from = from
        self.to = to
        self.room = room
        self.teacher = teacher
        self.isCanceled = isCanceled
    }
}

public struct PapillonHomework: Sendable, Identifiable, Hashable {
    public let id: String
    public let subject: String
    public let content: String
    public let dueDate: Date
    public let isDone: Bool
    public let isEvaluation: Bool

    public init(id: String, subject: String, content: String, dueDate: Date, isDone: Bool, isEvaluation: Bool) {
        self.id = id
        self.subject = subject
        self.content = content
        self.dueDate = dueDate
        self.isDone = isDone
        self.isEvaluation = isEvaluation
    }
}

public struct PapillonGrade: Sendable, Identifiable, Hashable {
    public let id: String
    public let subjectName: String
    public let gradeDescription: String
    public let givenAt: Date
    public let studentScore: Double?
    public let outOf: Double?

    public init(id: String, subjectName: String, gradeDescription: String, givenAt: Date, studentScore: Double?, outOf: Double?) {
        self.id = id
        self.subjectName = subjectName
        self.gradeDescription = gradeDescription
        self.givenAt = givenAt
        self.studentScore = studentScore
        self.outOf = outOf
    }
}
