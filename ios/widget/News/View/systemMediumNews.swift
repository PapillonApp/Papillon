//
//  systemMediumNews.swift
//  widgetsExtension
//
//  Created by Tom Theret on 14/12/2024.
//

import SwiftUI

struct systemMediumNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
      // Titre de la section
      HStack {
        Text("\(Image(systemName: "newspaper")) Dernière actualité")
        Spacer()
      }
      .font(.system(size: 16))
      .opacity(0.5)

      Spacer()

      // Affichage de la première actualité
      if entry.selectionnedAccount == "" {
        Text("Veuillez sélectionner un compte")
          .foregroundColor(.gray)
          .font(.system(size: 14))
      } else if let firstNews = entry.news.first,
        let newsDate = parseISO8601Date(firstNews.date)
      {  // Utilisation du parseur ISO 8601
        VStack(alignment: .leading) {
          Text(firstNews.title)
            .font(.system(size: 17))
            .fontWeight(.bold)
            .lineLimit(1)
          Text(firstNews.content)
            .font(.system(size: 15))
            .lineLimit(2)
        }

        Spacer()

        // Footer
        HStack {
          // Date relative de la news
          Text("\(Image(systemName: "clock")) \(relativeTime(from: newsDate))")
          Spacer()
          // Nombre d'attachements (converti en texte)
          Text("\(Image(systemName: "paperclip")) \(firstNews.attachments.count)")
        }
        .foregroundColor(.gray)
        .font(.system(size: 14))
      } else {
        Text("Aucune actualité disponible.")
          .foregroundColor(.gray)
          .font(.system(size: 14))
      }
    }
    .padding()
  }

  // Fonction pour calculer le temps relatif
  func relativeTime(from date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .full
    return formatter.localizedString(for: date, relativeTo: Date())
  }

  // Fonction pour convertir une chaîne ISO 8601 en Date
  func parseISO8601Date(_ dateString: String) -> Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter.date(from: dateString)
  }
}
