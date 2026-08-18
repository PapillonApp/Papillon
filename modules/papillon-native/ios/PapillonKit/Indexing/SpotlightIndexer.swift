import AppIntents
import CoreSpotlight
import Foundation

@available(iOS 18, *)
public actor SpotlightIndexer {
    public static let shared = SpotlightIndexer()

    private let indexName = "xyz.getpapillon.ios.spotlight"

    private static let courseIdsKey = "PapillonKit.indexedCourseIds"
    private static let homeworkIdsKey = "PapillonKit.indexedHomeworkIds"
    private static let gradeIdsKey = "PapillonKit.indexedGradeIds"
    private static let lastIndexedAtKey = "PapillonKit.lastIndexedAt"

    public struct IndexStats: Sendable {
        public let courseCount: Int
        public let homeworkCount: Int
        public let gradeCount: Int
        public let lastIndexedAt: Date?
    }

    private init() {}

    private var defaults: UserDefaults? {
        UserDefaults(suiteName: NativeDBConstants().appGroupId)
    }

    public func stats() -> IndexStats {
        IndexStats(
            courseCount: defaults?.stringArray(forKey: Self.courseIdsKey)?.count ?? 0,
            homeworkCount: defaults?.stringArray(forKey: Self.homeworkIdsKey)?.count ?? 0,
            gradeCount: defaults?.stringArray(forKey: Self.gradeIdsKey)?.count ?? 0,
            lastIndexedAt: (defaults?.object(forKey: Self.lastIndexedAtKey) as? Double).map(Date.init(timeIntervalSince1970:))
        )
    }

    public func reindexAll(accountIds: Set<String>) async throws {
        let index = CSSearchableIndex(name: indexName)

        let courses = try PapillonDataStore.courses(createdByAccounts: accountIds).map(CourseEntity.init)
        try await sync(index: index, entities: courses, previousIdsKey: Self.courseIdsKey)

        let homework = try PapillonDataStore.homework(createdByAccounts: accountIds).map(HomeworkEntity.init)
        try await sync(index: index, entities: homework, previousIdsKey: Self.homeworkIdsKey)

        let grades = try PapillonDataStore.grades(createdByAccounts: accountIds).map(GradeEntity.init)
        try await sync(index: index, entities: grades, previousIdsKey: Self.gradeIdsKey)

        defaults?.set(Date().timeIntervalSince1970, forKey: Self.lastIndexedAtKey)
    }

    public func clearAll() async throws {
        let index = CSSearchableIndex(name: indexName)

        try await delete(index: index, ids: defaults?.stringArray(forKey: Self.courseIdsKey) ?? [], type: CourseEntity.self)
        try await delete(index: index, ids: defaults?.stringArray(forKey: Self.homeworkIdsKey) ?? [], type: HomeworkEntity.self)
        try await delete(index: index, ids: defaults?.stringArray(forKey: Self.gradeIdsKey) ?? [], type: GradeEntity.self)

        defaults?.removeObject(forKey: Self.courseIdsKey)
        defaults?.removeObject(forKey: Self.homeworkIdsKey)
        defaults?.removeObject(forKey: Self.gradeIdsKey)
        defaults?.removeObject(forKey: Self.lastIndexedAtKey)
    }

    private func sync<Entity: IndexedEntity>(
        index: CSSearchableIndex,
        entities: [Entity],
        previousIdsKey: String
    ) async throws where Entity.ID == String {
        let currentIds = Set(entities.map(\.id))
        let previousIds = Set(defaults?.stringArray(forKey: previousIdsKey) ?? [])

        try await delete(index: index, ids: Array(previousIds.subtracting(currentIds)), type: Entity.self)
        try await index.indexAppEntities(entities)

        defaults?.set(Array(currentIds), forKey: previousIdsKey)
    }

    private func delete<Entity: IndexedEntity>(index: CSSearchableIndex, ids: [String], type: Entity.Type) async throws where Entity.ID == String {
        guard !ids.isEmpty else { return }
        try await index.deleteAppEntities(identifiedBy: ids, ofType: type)
    }
}
