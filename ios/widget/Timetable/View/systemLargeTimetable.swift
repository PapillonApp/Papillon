import SwiftUI

struct systemLargeTimetable: View {
  
    var entry: TimetableWidgetProvider.Entry
  
    var body: some View {
        
        let upcomingLessons = TimeHelper.filterUpcomingLessons(timetable: entry.timetable)
        
        VStack(alignment: .leading) {
            HStack {
                Text("\(Image(systemName: "calendar")) Prochains cours")
                Spacer()
            }
            .font(.system(size: 16))
            .opacity(0.5)

            Spacer()

            switch (entry.selectedAccount.isEmpty, upcomingLessons.isEmpty) {
            case (true, _):
                Text("Veuillez sélectionner un compte")
                  .foregroundColor(.gray)
                  .font(.system(size: 14))
            case (false, true):
                Text("Aucun cours, bon repos!")
                  .foregroundColor(.gray)
                  .font(.system(size: 14))
            case (false, false):
                let displayedNews = upcomingLessons.prefix(3)

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
