import SwiftUI

struct systemLargeNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
      // Titre de la section
      HStack {
        Text("\(Image(systemName: "newspaper")) Dernières actualités")
        Spacer()
      }
      .font(.system(size: 16))
      .opacity(0.5)

      Spacer()

      // Vérification de la sélection du compte
      if entry.selectionnedAccount == "" {
        Text("Veuillez sélectionner un compte")
          .foregroundColor(.gray)
          .font(.system(size: 14))
      } else if entry.news.isEmpty {
        Text("Aucune actualité disponible.")
          .foregroundColor(.gray)
          .font(.system(size: 14))
      } else {
        // Affichage des 3 premières actualités
        ForEach(entry.news.prefix(3), id: \.self.id) { newsItem in
          if let newsDate = parseISO8601Date(newsItem.date) {
            Divider() // Séparateur entre les actualités
            VStack(alignment: .leading) {
              // Titre de l'actualité
              Text(newsItem.title)
                .font(.system(size: 17))
                .fontWeight(.bold)
                .lineLimit(1)
              // Contenu de l'actualité
              Text(newsItem.content)
                .font(.system(size: 15))
                .lineLimit(2)
            }

            Spacer()

            // Footer avec la date et le nombre d'attachements
            HStack {
              // Date relative de l'actualité
              Text("\(Image(systemName: "clock")) \(relativeTime(from: newsDate))")
              Spacer()
              // Nombre d'attachements (converti en texte)
              Text("\(Image(systemName: "paperclip")) \(newsItem.attachments.count)")
            }
            .foregroundColor(.gray)
            .font(.system(size: 14))
          }
        }
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
