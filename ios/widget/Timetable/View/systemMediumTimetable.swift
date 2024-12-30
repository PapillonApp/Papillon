import SwiftUI

struct systemMediumTimetable: View {
  
    var entry: TimetableWidgetProvider.Entry

    var body: some View {
      
        let upcomingLessons = TimeHelper.filterUpcomingLessons(timetable: entry.timetable)
      
        VStack(alignment: .leading) {
          switch (entry.selectedAccount.isEmpty, upcomingLessons.first) {
          case (true, _):
              emptyMessageNoAccount(image: "calendar")
          case (false, nil):
            emptyTimetableMessage()
          case (false, let firstLesson?):
            HStack {
                Text("\(Image(systemName: "calendar")) Prochains cours")
                Spacer()
            }
            .font(.system(size: 16))
            .opacity(0.5)

            Spacer()
            VStack {
              lessonItem(item: firstLesson)
            }
          }
        }
        .padding()
        .widgetBackground(Color("WidgetBackground"))
    }
}
