import AppIntents
import CoreSpotlight
import Foundation

@available(iOS 18, *)
public struct GradeEntity: AppEntity, IndexedEntity {
    public static var typeDisplayRepresentation: TypeDisplayRepresentation = "Note"
    public static var defaultQuery = GradeEntityQuery()

    public let id: String
    public let subjectName: String
    public let gradeDescription: String
    public let givenAt: Date
    public let studentScore: Double?
    public let outOf: Double?

    public init(_ grade: PapillonGrade) {
        id = grade.id
        subjectName = grade.subjectName
        gradeDescription = grade.gradeDescription
        givenAt = grade.givenAt
        studentScore = grade.studentScore
        outOf = grade.outOf
    }

    private var scoreText: String {
        guard let studentScore else { return gradeDescription }
        guard let outOf else { return String(format: "%g", studentScore) }
        return "\(String(format: "%g", studentScore))/\(String(format: "%g", outOf))"
    }

    public var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(subjectName)",
            subtitle: "\(scoreText)",
            image: .init(systemName: "list.number")
        )
    }

    public var attributeSet: CSSearchableItemAttributeSet {
        let attributeSet = defaultAttributeSet
        attributeSet.title = subjectName
        attributeSet.contentDescription = "\(scoreText) — \(gradeDescription)"
        attributeSet.keywords = [subjectName]
        return attributeSet
    }
}

@available(iOS 18, *)
public struct GradeEntityQuery: EntityQuery {
    public init() {}

    public func entities(for identifiers: [String]) async throws -> [GradeEntity] {
        let accountIds = await PapillonKitConfiguration.shared.activeAccountIds
        guard !accountIds.isEmpty else { return [] }
        return try PapillonDataStore.grades(createdByAccounts: accountIds, ids: Set(identifiers)).map(GradeEntity.init)
    }
}
