import SwiftUI

struct systemMediumTimetable: View {
  
    var entry: TimetableWidgetProvider.Entry

    var body: some View {
      
        let upcomingLessons = TimeHelper.filterUpcomingLessons(timetable: entry.timetable)
      
        VStack(alignment: .leading) {
            HStack {
                Text("\(Image(systemName: "calendar")) Prochain cours")
                Spacer()
            }
            .font(.system(size: 16))
            .opacity(0.5)

            Spacer()
          
          switch (entry.selectedAccount.isEmpty, upcomingLessons.first) {
          case (true, _):
              Text("Veuillez sélectionner un compte")
                  .foregroundColor(.gray)
                  .font(.system(size: 14))
          case (false, nil):
              Text("Aucun cours, bon repos!")
                  .foregroundColor(.gray)
                  .font(.system(size: 14))
          case (false, let firstLesson?):
            VStack {
              lessonItem(item: firstLesson)
            }
          }
        }
        .padding()
        .widgetBackground(Color("WidgetBackground"))
    }
}
