import SwiftUI
import Foundation

// Hex color to Swiftui
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// Backgorund API
extension View {
    func widgetBackground(_ backgroundView: some View) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            return containerBackground(for: .widget) {
              backgroundView
            }
        } else {
          return background(backgroundView)
        }
    }
}

class TimeHelper {
    // String "il y a X minutes", "dans 2 secondes"
    static func relativeTime(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }
  
    // Format like 18:07
    static func formatTimestamp(_ timestamp: TimeInterval) -> String {
        let date = Date(timeIntervalSince1970: timestamp / 1000)
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
  
    static func parseISO8601Date(_ dateString: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: dateString)
    }
  
    static func filterUpcomingLessons(timetable: [TimetableClass]) -> [TimetableClass] {
        return timetable.filter { lesson in
            let lessonStart = Date(timeIntervalSince1970: lesson.startTimestamp / 1000)
            guard Calendar.current.isDateInToday(lessonStart) else { return false }
            let timeInterval = lessonStart.timeIntervalSince(Date())
            return timeInterval >= -15 * 60 && timeInterval <= 0
        }
    }
}
