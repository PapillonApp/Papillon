import Foundation
import SwiftUI
import WidgetKit

// MARK: retrieveTimetableData
func retrieveTimetableData(for accountID: String?) -> Timetable {
    let sharedDefaults = UserDefaults(suiteName: "group.xyz.getpapillon.ios")
    if let jsonString = sharedDefaults?.string(forKey: "timetable"),
       let jsonData = jsonString.data(using: .utf8) {
        do {
            if let jsonArray = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                var timetable = Timetable()
                
                for timetableItemDict in jsonArray {
                    if let localID = timetableItemDict["localID"] as? String,
                       let color = timetableItemDict["color"] as? String,
                       let subject = timetableItemDict["subject"] as? String,
                       let id = timetableItemDict["id"] as? String,
                       let typeString = timetableItemDict["type"] as? String,
                       let type = TimetableClass.ClassType(rawValue: typeString),
                       let title = timetableItemDict["title"] as? String,
                       let startTimestamp = timetableItemDict["startTimestamp"] as? TimeInterval,
                       let endTimestamp = timetableItemDict["endTimestamp"] as? TimeInterval {
                        
                        if localID == accountID {
                            let itemType = timetableItemDict["itemType"] as? String
                            let additionalNotes = timetableItemDict["additionalNotes"] as? String
                            let building = timetableItemDict["building"] as? String
                            let room = timetableItemDict["room"] as? String
                            let teacher = timetableItemDict["teacher"] as? String
                            let group = timetableItemDict["group"] as? String
                            let backgroundColor = timetableItemDict["backgroundColor"] as? String
                            let statusString = timetableItemDict["status"] as? String
                            let status = TimetableClassStatus(rawValue: statusString ?? "")
                            let statusText = timetableItemDict["statusText"] as? String
                            let source = timetableItemDict["source"] as? String
                            let url = timetableItemDict["url"] as? String
                            
                            let timetableClass = TimetableClass(
                                localID: localID,
                                color: color,
                                subject: subject,
                                id: .right(id),
                                type: type,
                                title: title,
                                itemType: itemType,
                                startTimestamp: startTimestamp,
                                endTimestamp: endTimestamp,
                                additionalNotes: additionalNotes,
                                building: building,
                                room: room,
                                teacher: teacher,
                                group: group,
                                backgroundColor: backgroundColor,
                                status: status,
                                statusText: statusText,
                                source: source,
                                url: url
                            )
                            
                            timetable.append(timetableClass)
                        }
                    }
                }
                return timetable
            }
        } catch {
            print(error)
        }
    }
    return []
}


// MARK: - Widget TimelineProvider
struct TimetableWidgetProvider: IntentTimelineProvider {
    typealias Entry = TimetableWidgetEntry
    typealias Intent = SelectAccountIntent

    func placeholder(in context: Context) -> TimetableWidgetEntry {
        TimetableWidgetEntry(date: Date(), selectedAccount: "", timetable: [])
    }

    func getSnapshot(for configuration: SelectAccountIntent, in context: Context, completion: @escaping (TimetableWidgetEntry) -> Void) {
        let sharedTimetable = retrieveTimetableData(for: configuration.selected?.identifier)
        let entry = TimetableWidgetEntry(date: Date(), selectedAccount: configuration.selected?.identifier ?? "", timetable: sharedTimetable)
        completion(entry)
    }

    func getTimeline(for configuration: SelectAccountIntent, in context: Context, completion: @escaping (Timeline<TimetableWidgetEntry>) -> Void) {
        let currentDate = Date()
        let sharedTimetable = retrieveTimetableData(for: configuration.selected?.identifier)
        let entry = TimetableWidgetEntry(date: currentDate, selectedAccount: configuration.selected?.identifier ?? "", timetable: sharedTimetable)
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
}

// MARK: Widget Entry
struct TimetableWidgetEntry: TimelineEntry {
    let date: Date
    let selectedAccount: String
    let timetable: Timetable
}

// MARK: Widget View
struct TimetableWidgetView: View {
    var entry: TimetableWidgetEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {

        case .systemMedium: systemMediumTimetable(entry: entry)
        case .systemLarge: systemLargeTimetable(entry: entry)

        default:
            Text("Erreur")
        }
    }
}

// MARK: Widget principal
struct TimetableWidget: Widget {
    private let supportedFamilies: [WidgetFamily] = {
        return [.systemMedium, .systemLarge]
    }()

    let kind: String = "TimetableWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: SelectAccountIntent.self, provider: TimetableWidgetProvider()) { entry in
            TimetableWidgetView(entry: entry)
        }
        .configurationDisplayName("Emploi du temps")
        .description("Affiche les prochains cours pour le compte sélectionné")
        .supportedFamilies(supportedFamilies)
        .contentMarginsDisabled()
    }
}

struct TimetableWidget_Previews: PreviewProvider {
    static var previews: some View {
        TimetableWidgetView(entry: TimetableWidgetEntry(date: Date(), selectedAccount: "", timetable: []))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
