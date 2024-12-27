import SwiftUI

struct systemMediumNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
      HStack {
        Text("\(Image(systemName: "newspaper")) Dernière actualité")
        Spacer()
      }
      .font(.system(size: 16))
      .opacity(0.5)

      Spacer()

      switch (entry.selectionnedAccount.isEmpty, entry.news.first) {
      case (true, _):
          Text("Veuillez sélectionner un compte")
              .foregroundColor(.gray)
              .font(.system(size: 14))
      case (false, nil):
          Text("Aucune actualité disponible.")
              .foregroundColor(.gray)
              .font(.system(size: 14))
      case (false, let firstNews?):
        VStack {
          newsItem(item: firstNews)
        }
      }
    }
    .padding()
    .widgetBackground(Color("WidgetBackground"))
  }
}
