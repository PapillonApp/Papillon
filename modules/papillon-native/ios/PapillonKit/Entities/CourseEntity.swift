import AppIntents
import CoreSpotlight
import Foundation

@available(iOS 18, *)
public struct CourseEntity: AppEntity, IndexedEntity {
    public static var typeDisplayRepresentation: TypeDisplayRepresentation = "Cours"
    public static var defaultQuery = CourseEntityQuery()

    public let id: String
    public let subject: String
    public let from: Date
    public let to: Date
    public let room: String?
    public let teacher: String?
    public let isCanceled: Bool

    public init(_ course: PapillonCourse) {
        id = course.id
        subject = course.subject
        from = course.from
        to = course.to
        room = course.room
        teacher = course.teacher
        isCanceled = course.isCanceled
    }

    public var displayRepresentation: DisplayRepresentation {
        let subtitle = [room, teacher].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · ")
        return DisplayRepresentation(
            title: "\(subject)",
            subtitle: "\(subtitle)",
            image: .init(systemName: isCanceled ? "calendar.badge.exclamationmark" : "calendar")
        )
    }

    public var attributeSet: CSSearchableItemAttributeSet {
        let attributeSet = defaultAttributeSet
        attributeSet.title = subject
        attributeSet.contentDescription = [room, teacher].compactMap { $0 }.joined(separator: " · ")
        attributeSet.startDate = from
        attributeSet.endDate = to
        attributeSet.keywords = [subject, room, teacher].compactMap { $0 }
        return attributeSet
    }
}

@available(iOS 18, *)
public struct CourseEntityQuery: EntityQuery {
    public init() {}

    public func entities(for identifiers: [String]) async throws -> [CourseEntity] {
        let accountIds = await PapillonKitConfiguration.shared.activeAccountIds
        guard !accountIds.isEmpty else { return [] }
        return try PapillonDataStore.courses(createdByAccounts: accountIds, ids: Set(identifiers)).map(CourseEntity.init)
    }
}
