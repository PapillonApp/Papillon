import SwiftUI

struct systemLargeTimetable: View {
  
    var entry: TimetableWidgetProvider.Entry
  
    var body: some View {
        
        let upcomingLessons = TimeHelper.filterUpcomingLessons(timetable: entry.timetable)
        
        VStack(alignment: .leading) {
            switch (entry.selectedAccount.isEmpty, upcomingLessons.isEmpty) {
            case (true, _):
              emptyMessageNoAccount(image: "calendar")
            case (false, true):
              emptyTimetableMessage()
            case (false, false):
                let displayedNews = upcomingLessons.prefix(3)
              
              HStack {
                  Text("\(Image(systemName: "calendar")) Prochains cours")
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
                              lessonItem(item: displayedNews[index])
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
