import SwiftUI

struct systemLargeNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
        HStack {
            Text("\(Image(systemName: "newspaper")) Dernières actualités")
            Spacer()
        }
        .font(.system(size: 16))
        .opacity(0.5)

        Spacer()

        switch (entry.selectionnedAccount.isEmpty, entry.news.isEmpty) {
        case (true, _):
            Text("Veuillez sélectionner un compte")
              .foregroundColor(.gray)
              .font(.system(size: 14))
        case (false, true):
            Text("Aucune actualité disponible.")
              .foregroundColor(.gray)
              .font(.system(size: 14))
        case (false, false):
            let displayedNews = entry.news.prefix(3)

            ForEach(0..<3, id: \.self) { index in
                VStack {
                    if index < displayedNews.count {
                        Divider()
                        VStack {
                            newsItem(item: displayedNews[index])
                        }
                        .padding(.trailing)
                    } else {
                        Spacer()
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
    }
    .padding([.vertical, .leading])
    .widgetBackground(Color("WidgetBackground"))
  }
}