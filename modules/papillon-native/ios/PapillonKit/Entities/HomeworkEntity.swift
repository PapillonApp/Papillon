import AppIntents
import CoreSpotlight
import Foundation

@available(iOS 18, *)
public struct HomeworkEntity: AppEntity, IndexedEntity {
    public static var typeDisplayRepresentation: TypeDisplayRepresentation = "Devoir"
    public static var defaultQuery = HomeworkEntityQuery()

    public let id: String
    public let subject: String
    public let content: String
    public let dueDate: Date
    public let isDone: Bool
    public let isEvaluation: Bool

    public init(_ homework: PapillonHomework) {
        id = homework.id
        subject = homework.subject
        content = homework.content
        dueDate = homework.dueDate
        isDone = homework.isDone
        isEvaluation = homework.isEvaluation
    }

    public var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(subject)",
            subtitle: "\(content)",
            image: .init(systemName: isDone ? "checkmark.circle" : "book.closed")
        )
    }

    public var attributeSet: CSSearchableItemAttributeSet {
        let attributeSet = defaultAttributeSet
        attributeSet.title = subject
        attributeSet.contentDescription = content
        attributeSet.dueDate = dueDate
        attributeSet.completionDate = isDone ? dueDate : nil
        attributeSet.keywords = [subject]
        return attributeSet
    }
}

@available(iOS 18, *)
public struct HomeworkEntityQuery: EntityQuery {
    public init() {}

    public func entities(for identifiers: [String]) async throws -> [HomeworkEntity] {
        let accountIds = await PapillonKitConfiguration.shared.activeAccountIds
        guard !accountIds.isEmpty else { return [] }
        return try PapillonDataStore.homework(createdByAccounts: accountIds, ids: Set(identifiers)).map(HomeworkEntity.init)
    }
}
