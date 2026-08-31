import AppIntents
import SwiftUI

@available(iOS 26.0, *)
struct TimetableControlAction: AppIntent {
  static let title: LocalizedStringResource = "Ouvrir l'emploi du temps"
  static var supportedModes: IntentModes { .foreground }
  
  func perform() async throws -> some IntentResult {
    let url = URL(string: "papillon://calendar")!
    
    await EnvironmentValues().openURL(url)
    
    return .result()
  }
}
