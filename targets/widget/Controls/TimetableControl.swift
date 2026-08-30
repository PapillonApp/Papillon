import AppIntents
import WidgetKit
import SwiftUI
import OSLog

@available(iOS 26.0, *)
struct TimetableControl: ControlWidget {
  static let kind: String = "xyz.getpapillon.ios.widget.control.timetable"
  
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: Self.kind) {
      ControlWidgetButton(action: TimetableControlAction()) {
        Label("Mon emploi du temps", systemImage: "calendar")
      }
    }
    .displayName("Ouvrir l'emploi du temps")
    .description("Un contrôle pour ouvrir ton emploi du temps dans Papillon.")
  }
}
