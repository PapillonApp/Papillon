//
//  TaskWidgetProvider.swift
//  Papillon
//
//  Created by Rémy Godet on 25/01/2026.
//

import WidgetKit

struct TaskWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> TaskWidgetEntry {
    TaskWidgetEntry(date: .now, task_total: 5, task_undone: 3, tasks: [:]);
  }
  
  func getSnapshot(in context: Context, completion: @escaping (TaskWidgetEntry) -> ()) {
    let entry = TaskWidgetEntry(date: .now, task_total: 5, task_undone: 3, tasks: [:]);
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    let isDatabaseCreated = Database.isDatabaseCreated();
    var entries: [TaskWidgetEntry] = [];
    
    if isDatabaseCreated {
      var today = Date.now;
      
      if (Calendar.current.isDateInWeekend(today))
      {
        if let nextMonday = Calendar.current.nextDate(after: today, matching: DateComponents(weekday: 2), matchingPolicy: .nextTime) {
          today = nextMonday;
        }
      }
      let tasks = Database.getHomeworkForWeek(week: today);
      
      var undone_tasks: Int = 0;
      var todo_tasks: [Date: [TaskWidgetEntryTask]] = [:];
      
      tasks.forEach { task in
        if (!task.isDone) {
          undone_tasks += 1;
          
          let dueDate = Date(timeIntervalSince1970: TimeInterval(task.dueDate / 1000));
          
          if (Calendar.current.isDateInToday(dueDate) || dueDate > .now) {
            let subject = Database.getSubjectCustomisation(subjectId: task.subject);
            
            
            if var tasksForDate = todo_tasks[dueDate] {
              tasksForDate.append(TaskWidgetEntryTask(
                id: task.homeworkId,
                subject_name: subject.name,
                subject_emoji: subject.emoji,
                content: task.content
              ))
              todo_tasks[dueDate] = tasksForDate
            } else {
              todo_tasks[dueDate] = [TaskWidgetEntryTask(
                id: task.homeworkId,
                subject_name: subject.name,
                subject_emoji: subject.emoji,
                content: task.content
              )]
            }
          }
        }
      }
      
      entries.append(TaskWidgetEntry(
        date: .now,
        task_total: tasks.count,
        task_undone: undone_tasks,
        tasks: todo_tasks
      ));
    } else {
      entries.append(TaskWidgetEntry(
        date: .now,
        task_total: nil,
        task_undone: nil,
        tasks: [:]
      ));
    }
    
    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
}

