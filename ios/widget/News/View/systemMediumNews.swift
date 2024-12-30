import SwiftUI

struct systemMediumNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
      switch (entry.selectionnedAccount.isEmpty, entry.news.first) {
      case (true, _):
        emptyMessageNoAccount(image: "newspaper")
      case (false, nil):
        emptyNewsMessage()
      case (false, let firstNews?):
        HStack {
          Text("\(Image(systemName: "newspaper")) Dernière actualité")
          Spacer()
        }
        .font(.system(size: 16))
        .opacity(0.5)

        Spacer()
        VStack {
          newsItem(item: firstNews)
        }
      }
    }
    .padding()
    .widgetBackground(Color("WidgetBackground"))
  }
}
