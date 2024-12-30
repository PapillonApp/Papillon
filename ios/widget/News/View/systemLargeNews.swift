import SwiftUI

struct systemLargeNews: View {
  var entry: NewsWidgetProvider.Entry

  var body: some View {
    VStack(alignment: .leading) {
        switch (entry.selectionnedAccount.isEmpty, entry.news.isEmpty) {
        case (true, _):
          emptyMessageNoAccount(image: "newspaper")
        case (false, true):
          emptyNewsMessage()
        case (false, false):
            let displayedNews = entry.news.prefix(3)
          
          HStack {
              Text("\(Image(systemName: "newspaper")) Dernières actualités")
              Spacer()
          }
          .font(.system(size: 16))
          .opacity(0.5)

          Spacer()

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
