//
//  Homework.swift
//  Papillon
//
//  Created by Rémy Godet on 01/02/2026.
//

struct HomeworkModel {
  let createdByAccount: String;
  let kidName: String;
  let homeworkId: String;
  let subject: String;
  let content: String;
  let dueDate: Int64;
  let isDone: Bool;
  let returnFormat: Int;
  let attachments: String;
  let evaluation: Bool;
  let custom: Bool;
}
