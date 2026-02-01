//
//  TaskWidgetEntry.swift
//  Papillon
//
//  Created by Rémy Godet on 25/01/2026.
//

import WidgetKit

struct TaskWidgetEntryTask: Identifiable {
  let id: String;
  let subject_name: String;
  let subject_emoji: String;
  let content: String;
}

struct TaskWidgetEntry: TimelineEntry {
  var date: Date;
  let task_total: Int?;
  let task_undone: Int?;
  let tasks: [Date: [TaskWidgetEntryTask]];
}
