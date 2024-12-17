import Foundation
import SwiftUI
import WidgetKit

// Fonction pour récupérer les données partagées et les convertir en NewsItem
func retrieveNewsData(for accountID: String?) -> [NewsItem] {
    let sharedDefaults = UserDefaults(suiteName: "group.xyz.getpapillon.ios")
    if let jsonString = sharedDefaults?.string(forKey: "news"),
       let jsonData = jsonString.data(using: .utf8) {
        do {
            if let jsonArray = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                var newsItems = [NewsItem]()
                
                for newsItemDict in jsonArray {
                    if let localID = newsItemDict["localID"] as? String,
                       let id = newsItemDict["id"] as? String,
                       let title = newsItemDict["title"] as? String,
                       let date = newsItemDict["date"] as? String,
                       let acknowledged = newsItemDict["acknowledged"] as? Bool,
                       let attachmentsArray = newsItemDict["attachments"] as? [[String: Any]],
                       let content = newsItemDict["content"] as? String,
                       let author = newsItemDict["author"] as? String,
                       let category = newsItemDict["category"] as? String,
                       let read = newsItemDict["read"] as? Bool,
                       let refDict = newsItemDict["ref"] as? [String: Any],
                       let enclosureDict = refDict["enclosure"] as? [String: Any],
                       let enclosureURL = enclosureDict["url"] as? String,
                       let enclosureType = enclosureDict["type"] as? String,
                       let pubDate = refDict["pubDate"] as? String,
                       let refTitle = refDict["title"] as? String,
                       let refContent = refDict["content"] as? String,
                       let link = refDict["link"] as? String {

                        // Filtrer les actualités par compte si accountID est défini
                        if localID == accountID {
                            let attachments = attachmentsArray.compactMap { attachmentDict in
                                if let name = attachmentDict["name"] as? String,
                                   let type = attachmentDict["type"] as? String,
                                   let url = attachmentDict["url"] as? String {
                                    return Attachment(name: name, type: type, url: url)
                                }
                                return nil
                            }

                            let enclosure = Enclosure(url: enclosureURL, tyoe: enclosureType)
                            let ref = Ref(enclosure: enclosure, pubDate: pubDate, title: refTitle, content: refContent, link: link)
                            let newsItem = NewsItem(localID: localID, id: id, title: title, date: date, acknowledged: acknowledged, attachments: attachments, content: content, author: author, category: category, read: read, ref: ref)
                            newsItems.append(newsItem)
                        }
                    }
                }

                return newsItems
            }
        } catch {
            print("Erreur lors du décodage JSON : \(error)")
        }
    }
    return []
}

// Widget TimelineProvider
struct NewsWidgetProvider: IntentTimelineProvider {
    typealias Entry = NewsWidgetEntry
    typealias Intent = SelectAccountIntent // Intégration de votre intent

    func placeholder(in context: Context) -> NewsWidgetEntry {
      NewsWidgetEntry(date: Date(), selectionnedAccount: "", news: [])
    }

    func getSnapshot(for configuration: SelectAccountIntent, in context: Context, completion: @escaping (NewsWidgetEntry) -> Void) {
        // Récupérer les actualités pour l'aperçu avec l'identifiant sélectionné
      let sharedNews = retrieveNewsData(for: configuration.selected?.identifier)
      let entry = NewsWidgetEntry(date: Date(), selectionnedAccount: configuration.selected?.identifier ?? "", news: sharedNews)
        completion(entry)
    }

    func getTimeline(for configuration: SelectAccountIntent, in context: Context, completion: @escaping (Timeline<NewsWidgetEntry>) -> Void) {
        let currentDate = Date()
        // Récupérer les actualités pour l'identifiant sélectionné
      let sharedNews = retrieveNewsData(for: configuration.selected?.identifier)
        let entry = NewsWidgetEntry(date: currentDate, selectionnedAccount: configuration.selected?.identifier ?? "", news: sharedNews)
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
}

// Widget Entry
struct NewsWidgetEntry: TimelineEntry {
    let date: Date
    let selectionnedAccount: String
    let news: [NewsItem]
}

// Widget View
struct NewsWidgetView: View {
    var entry: NewsWidgetEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {

        case .systemMedium: systemMediumNews(entry: entry)
        case .systemLarge: systemLargeNews(entry: entry)

        default:
            Text("Erreur")
        }
    }
}

// Widget principal
struct NewsWidget: Widget {
    private let supportedFamilies: [WidgetFamily] = {
            return [.systemMedium, .systemLarge]
    }()

    let kind: String = "NewsWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: SelectAccountIntent.self, provider: NewsWidgetProvider()) { entry in
            NewsWidgetView(entry: entry)
        }
        .configurationDisplayName("Actualités")
        .description("Affiche les nouvelles les plus récentes pour le compte sélectionné")
        .supportedFamilies(supportedFamilies)
        .contentMarginsDisabled()
    }
}

struct NewsWidget_Previews: PreviewProvider {
    static var previews: some View {
      NewsWidgetView(entry: NewsWidgetEntry(date: Date(), selectionnedAccount: "", news: []))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
