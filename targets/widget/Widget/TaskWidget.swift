//
//  widget.swift
//  widget
//
//  Created by Rémy Godet on 25/01/2026.
//

import WidgetKit
import SwiftUI

struct TaskWidgetRing: View {
  let total: CGFloat;
  let undone: CGFloat;
  
  var body: some View {
    ZStack {
      Circle()
        .stroke(
          Color("PapillonPink").opacity(0.1),
          style: StrokeStyle(lineWidth: 5)
        )
      Circle()
        .trim(
          from: 0,
          to: (total - undone) / total
        )
        .stroke(
          Color("PapillonPink"),
          style: StrokeStyle(
            lineWidth: 5,
            lineCap: .round
          )
        )
        .rotationEffect(.degrees(-90))
    }
    .offset(y: 2.5)
    .frame(width: 28, height: 28)
  }
}

struct TaskWidgetAllDone: View {
  var body: some View {
    VStack(spacing: 10) {
      Text("🎉")
        .font(Font.custom("SNPro-Semibold", size: 32))
      Text("Il ne te reste aucun devoir à faire")
        .foregroundStyle(Color("PapillonPink").mix(with: .black,by: 0.2))
        .font(Font.custom("SNPro-Semibold", size: 14))
        .multilineTextAlignment(.center)
    }
  }
}

struct TaskWidgetTask: View {
  let task: TaskWidgetEntryTask;
  
  func convertHtmlToText(html: String) -> String {
    if let data = html.data(using: .utf8) {
      if let attributedString = try? NSAttributedString(
        data: data,
        options: [
          .documentType: NSAttributedString.DocumentType.html,
          .characterEncoding: String.Encoding.utf8.rawValue
        ],
        documentAttributes: nil
      ) {
        return (attributedString.string);
      }
    }
    return "Oups ! On a pas réussi à lire ton devoir. :(";
  }
  
  var body: some View {
    VStack(alignment: .leading,spacing: 8) {
      HStack {
        Circle()
          .fill(.black.opacity(0.03))
          .stroke(
            .black.opacity(0.05),
            style: StrokeStyle(
              lineWidth: 1
            )
          )
          .overlay(content: {
            Text(task.subject_emoji)
              .font(Font.custom("SNPro-Semibold", size: 11))
          })
          .frame(width: 22, height: 22)
        Text(task.subject_name)
          .foregroundStyle(Color("PapillonPink").mix(with: .black,by: 0.2))
          .font(Font.custom("SNPro-Semibold", size: 14))
      }
      Text(convertHtmlToText(html: task.content))
        .foregroundStyle(Color("PapillonPink").mix(with: .black,by: 0.2).opacity(0.8))
        .font(Font.custom("SNPro-Semibold", size: 13))
        .fixedSize(
          horizontal: false,
          vertical: true
        )
    }
  }
}

struct TaskWidgetView: View {
  let entry: TaskWidgetEntry;
  @Environment(\.widgetFamily) var family;
  
  func dateToRelative(date: Date) -> String {
    if Calendar.current.isDateInToday(date) {
      return "aujourd'hui";
    } else if Calendar.current.isDateInTomorrow(date) {
      return "demain";
    } else {
      let formatter = DateFormatter();
      formatter.dateFormat = "EEEE";
      return formatter.string(from: date)
    }
  }
  
  var body: some View {
    HStack() {
      ZStack(alignment: .leading) {
        Color.clear
        VStack (alignment: .leading) {
          TaskWidgetRing(total: CGFloat(entry.task_total ?? 3), undone: CGFloat(entry.task_undone ?? 2))
          Spacer()
          Text(entry.task_undone?.formatted() ?? "-")
            .font(Font.custom("SNPro-Semibold", size: 36))
            .foregroundStyle(Color("PapillonPink"))
          Text("Tâches restante")
            .font(Font.custom("SNPro-Semibold", size: 17))
            .foregroundStyle(Color("PapillonPink"))
          Text("Cette semaine")
            .font(Font.custom("SNPro-Medium", size: 15))
            .foregroundStyle(Color("PapillonPink").opacity(0.65))
        }
      }
      if (family == .systemMedium) {
        Color.clear
          .overlay(
            alignment: entry.tasks.isEmpty ? .center : .topLeading
          ) {
            if (entry.tasks.isEmpty) {
              TaskWidgetAllDone();
            } else {
              VStack(alignment: .leading, spacing: 10) {
                ForEach(
                  entry.tasks.keys.sorted(),
                  id: \.timeIntervalSince1970
                ) { key in
                  Text("Pour \(dateToRelative(date: key))")
                    .font(Font.custom("SNPro-Semibold", size: 15))
                    .foregroundStyle(Color("PapillonPink").opacity(0.8))
                  ForEach(entry.tasks[key]!) { task in
                    TaskWidgetTask(task: task)
                  }
                }
              }
            }
          }
          .mask {
            VStack(spacing: 0) {
              Rectangle()
              if (!entry.tasks.isEmpty) {
                LinearGradient(
                  colors: [.black, .clear],
                  startPoint: .top,
                  endPoint: .bottom
                )
                .frame(height: 80)
              }
            }
          }
      }
    }
    .widgetURL(URL(string: "papillon:///(tabs)/tasks"))
  }
}

struct TaskWidget: Widget {
  let kind: String = "widget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: TaskWidgetProvider()) { entry in
      TaskWidgetView(entry: entry)
        .containerBackground(for: ContainerBackgroundPlacement.widget) {
          Color("PapillonPink")
          LinearGradient(colors: [
            Color("PapillonWidgetGradientTop"),
            Color("PapillonWidgetGradientBottom")
          ], startPoint: .top, endPoint: .bottom)
        }
    }
    .configurationDisplayName("Tasks")
    .description("Follow your task to do.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
