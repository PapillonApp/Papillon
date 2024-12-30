import SwiftUI

struct lessonItem: View {
  
    @State private var roomRectangleWidth: CGFloat = 20
    @State private var roomRectangleHeight: CGFloat = 20
    @State private var statusRectangleWidth: CGFloat = 20
    @State private var statusRectangleHeight: CGFloat = 20

    var item: TimetableClass
  
    var body: some View {
        VStack {
          HStack {
              Rectangle()
                  .fill(
                      Color(hex: item.status == .canceled ? "#D10000" : item.color)
                  )
                  .frame(width: 7)
                  .cornerRadius(25)

              VStack(alignment: .leading, spacing: 0) {
                    Text(item.subject)
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .lineLimit(1)

                    Text(item.teacher ?? "Aucun professeur")
                        .font(.system(size: 15))
                        .lineLimit(1)
                
                HStack(spacing: 0) {
                    GeometryReader { geometry in
                        ZStack {
                            Rectangle()
                                .fill(Color(hex: item.status == .canceled ? "#D10000" : item.backgroundColor!).opacity(0.35))
                                .frame(width: roomRectangleWidth, height: roomRectangleHeight)
                                .cornerRadius(5)

                            Text(item.room ?? "Aucune salle")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color(hex: item.status == .canceled ? "#900000" : item.color))
                                .background(
                                    GeometryReader { textGeometry in
                                        Color.clear
                                            .onAppear {
                                                roomRectangleWidth = textGeometry.size.width + 10
                                                roomRectangleHeight = textGeometry.size.height + 2
                                            }
                                            .onChange(of: textGeometry.size) { newSize in
                                                roomRectangleWidth = newSize.width + 10
                                                roomRectangleHeight = newSize.height + 2
                                            }
                                    }
                                )
                        }
                    }
                    .frame(width: roomRectangleWidth, height: roomRectangleHeight)
                    .padding(.trailing, 5)
                    
                    if item.status != .none {
                        GeometryReader { geometry in
                            ZStack {
                                Rectangle()
                                    .fill(Color(hex: item.status == .canceled ? "#D10000" : item.color))
                                    .cornerRadius(5)

                                Text(item.status!.rawValue)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .minimumScaleFactor(0.8)
                                    .lineLimit(1)
                                    .background(
                                        GeometryReader { textGeometry in
                                            Color.clear
                                                .onAppear {
                                                    statusRectangleWidth = textGeometry.size.width + 10 // Marges dynamiques
                                                    statusRectangleHeight = textGeometry.size.height + 2
                                                }
                                                .onChange(of: textGeometry.size) { newSize in
                                                    statusRectangleWidth = newSize.width + 10
                                                    statusRectangleHeight = newSize.height + 2
                                                }
                                        }
                                    )
                            }
                            .frame(width: statusRectangleWidth, height: statusRectangleHeight)
                        }
                    }
                    Spacer()
                }
                .frame(height: max(roomRectangleHeight, statusRectangleHeight))
                .padding(.top, 5)
                }
          }
          
          Spacer()

          HStack {
              Text("\(Image(systemName: "clock")) \(TimeHelper.relativeTime(from: Date(timeIntervalSince1970: item.startTimestamp / 1000))) de \(TimeHelper.formatTimestamp(item.startTimestamp)) à \(TimeHelper.formatTimestamp(item.endTimestamp))")
              Spacer()
          }
          .foregroundColor(.gray)
          .font(.system(size: 14))
        }
    }
}
