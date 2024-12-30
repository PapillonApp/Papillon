// This file was generated from JSON Schema using quicktype, do not modify it directly.
// To parse the JSON, add this file to your project and do:
//
//   let welcome = try? JSONDecoder().decode(News.self, from: jsonData)

import Foundation

// MARK: - NewsItem
struct NewsItem: Codable {
    let localID, id, title, date: String
    let acknowledged: Bool
    let attachments: [Attachment]
    let content, author, category: String
    let read: Bool
    let ref: Ref
}

// MARK: - Attachment
struct Attachment: Codable {
    let name, type, url: String
}

// MARK: - Ref
struct Ref: Codable {
    let enclosure: Enclosure
    let pubDate, title, content, link: String
}

// MARK: - Enclosure
struct Enclosure: Codable {
    let url, tyoe: String
}

typealias News = [NewsItem]
