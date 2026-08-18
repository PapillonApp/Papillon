import Foundation

public struct SpotlightDebugSnapshot: Sendable {
    public let activeAccountIds: [String]
    public let indexedCourseCount: Int
    public let indexedHomeworkCount: Int
    public let indexedGradeCount: Int
    public let rawCourseCount: Int
    public let rawHomeworkCount: Int
    public let rawGradeCount: Int
    public let lastIndexedAt: Date?
}

public enum PapillonKit {
    public static func reindexSpotlight(accountIds: [String]) async throws {
        let accountIds = Set(accountIds)
        await PapillonKitConfiguration.shared.setActiveAccountIds(accountIds)
        if #available(iOS 18, *) {
            try await SpotlightIndexer.shared.reindexAll(accountIds: accountIds)
        }
    }

    public static func clearSpotlightIndex() async throws {
        await PapillonKitConfiguration.shared.setActiveAccountIds([])
        if #available(iOS 18, *) {
            try await SpotlightIndexer.shared.clearAll()
        }
    }

    public static func debugSnapshot() async -> SpotlightDebugSnapshot {
        let accountIds = await PapillonKitConfiguration.shared.activeAccountIds

        var rawCourseCount = 0
        var rawHomeworkCount = 0
        var rawGradeCount = 0
        if !accountIds.isEmpty {
            rawCourseCount = (try? PapillonDataStore.courses(createdByAccounts: accountIds).count) ?? 0
            rawHomeworkCount = (try? PapillonDataStore.homework(createdByAccounts: accountIds).count) ?? 0
            rawGradeCount = (try? PapillonDataStore.grades(createdByAccounts: accountIds).count) ?? 0
        }

        guard #available(iOS 18, *) else {
            return SpotlightDebugSnapshot(
                activeAccountIds: Array(accountIds),
                indexedCourseCount: 0,
                indexedHomeworkCount: 0,
                indexedGradeCount: 0,
                rawCourseCount: rawCourseCount,
                rawHomeworkCount: rawHomeworkCount,
                rawGradeCount: rawGradeCount,
                lastIndexedAt: nil
            )
        }

        let stats = await SpotlightIndexer.shared.stats()
        return SpotlightDebugSnapshot(
            activeAccountIds: Array(accountIds),
            indexedCourseCount: stats.courseCount,
            indexedHomeworkCount: stats.homeworkCount,
            indexedGradeCount: stats.gradeCount,
            rawCourseCount: rawCourseCount,
            rawHomeworkCount: rawHomeworkCount,
            rawGradeCount: rawGradeCount,
            lastIndexedAt: stats.lastIndexedAt
        )
    }
}
