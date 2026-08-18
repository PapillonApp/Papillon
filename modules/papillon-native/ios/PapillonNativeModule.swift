import ExpoModulesCore

public final class PapillonNativeModule: Module {
    public func definition() -> ModuleDefinition {
        Name("PapillonNative")

        AsyncFunction("reindexSpotlight") { (accountIds: [String]) in
            try await PapillonKit.reindexSpotlight(accountIds: accountIds)
        }

        AsyncFunction("clearSpotlightIndex") {
            try await PapillonKit.clearSpotlightIndex()
        }

        AsyncFunction("getSpotlightDebugSnapshot") { () -> [String: Any] in
            let snapshot = await PapillonKit.debugSnapshot()
            return [
                "activeAccountIds": snapshot.activeAccountIds,
                "indexedCourseCount": snapshot.indexedCourseCount,
                "indexedHomeworkCount": snapshot.indexedHomeworkCount,
                "indexedGradeCount": snapshot.indexedGradeCount,
                "rawCourseCount": snapshot.rawCourseCount,
                "rawHomeworkCount": snapshot.rawHomeworkCount,
                "rawGradeCount": snapshot.rawGradeCount,
                "lastIndexedAt": snapshot.lastIndexedAt.map { $0.timeIntervalSince1970 * 1000 } ?? NSNull(),
            ]
        }
    }
}
