import Foundation

public actor PapillonKitConfiguration {
    public static let shared = PapillonKitConfiguration()

    public private(set) var activeAccountIds: Set<String> = []

    private init() {}

    public func setActiveAccountIds(_ accountIds: Set<String>) {
        self.activeAccountIds = accountIds
    }
}
