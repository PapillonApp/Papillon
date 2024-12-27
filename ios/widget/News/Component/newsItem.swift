import SwiftUI

struct newsItem: View {
  
    var item: NewsItem
  
    var body: some View {
      VStack(alignment: .leading) {
        Text(item.title)
          .font(.system(size: 17))
          .fontWeight(.bold)
          .lineLimit(1)
        Text(item.content.isEmpty ? "Aucune description disponible" : item.content)
          .font(.system(size: 15))
          .lineLimit(2)
      }

      Spacer()
      
      HStack {
        Text("\(Image(systemName: "clock")) \(TimeHelper.relativeTime(from: TimeHelper.parseISO8601Date(item.date)!))")
        Spacer()
        Text("\(Image(systemName: "paperclip")) \(item.attachments.count)")
      }
      .foregroundColor(.gray)
      .font(.system(size: 14))
    }
}
