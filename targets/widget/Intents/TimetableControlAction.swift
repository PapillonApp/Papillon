import AppIntents

@available(iOS 26.0, *)
struct TimetableControlAction: AppIntent {
  static let title: LocalizedStringResource = "Ouvrir l'emploi du temps"
  static var supportedModes: IntentModes { .foreground }
  
  func perform() async throws -> some IntentResult & OpensIntent {
    return .result(
      opensIntent: OpenURLIntent(URL(string: "papillon://calendar")!)
    )
  }
}
