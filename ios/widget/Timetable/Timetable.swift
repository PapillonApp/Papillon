import Foundation

enum TimetableClassStatus: String {
    case canceled = "Annulé"
    case modified = "Modifié"
    case online = "En ligne"
    case test = "Devoirs surveillé"
}

struct TimetableClass {
    let localID: String
    let color: String
    let subject: String
    let id: Either<Int, String> // Custom enum to handle Int or String
    let type: ClassType
    let title: String
    let itemType: String?
    let startTimestamp: TimeInterval
    let endTimestamp: TimeInterval
    let additionalNotes: String?
    let building: String?
    let room: String?
    let teacher: String?
    let group: String?
    let backgroundColor: String?
    let status: TimetableClassStatus?
    let statusText: String?
    let source: String?
    let url: String?
    
    enum ClassType: String {
        case lesson = "lesson"
        case activity = "activity"
        case detention = "detention"
        case vacation = "vacation"
    }
}

// A typealias to represent the Timetable as an array of TimetableClass
typealias Timetable = [TimetableClass]

// Helper enum to represent a property that could be either Int or String
enum Either<A, B> {
    case left(A)
    case right(B)
}
