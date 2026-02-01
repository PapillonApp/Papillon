//
//  Database.swift
//  Papillon
//
//  Created by Rémy Godet on 25/01/2026.
//

import Foundation
import SQLite3
import MMKV

struct Database {
  static let    groupIdentifier: String = "group.xyz.getpapillon.ios";
  static let    databaseFilename: String = "default.db"
  
  // MARK: - Database Opening
  
  static var    databasePath: URL? {
    FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupIdentifier)?
      .appendingPathComponent(databaseFilename)
  }
  
  static func isDatabaseCreated() -> Bool {
    guard let path = databasePath else {
      return false
    }
    
    return FileManager.default.fileExists(atPath: path.path)
  }
  
  static func openDatabase() -> OpaquePointer? {
    var db: OpaquePointer?;
    
    if sqlite3_open(databasePath!.path, &db) == SQLITE_OK {
      return db;
    }
    return nil;
  }
  
  // MARK: - Database Query
  
  static func queryDatabase(query: String, db: OpaquePointer) -> OpaquePointer? {
    var queryStatement: OpaquePointer?
    
    if sqlite3_prepare_v2(db, query, -1, &queryStatement, nil) == SQLITE_OK {
      return queryStatement;
    }
    return nil;
  }
  
  static func forEachRow(
    queryStatement: OpaquePointer,
    _callback: (_ row: OpaquePointer?) -> Void
  ) {
    while sqlite3_step(queryStatement) == SQLITE_ROW {
      _callback(queryStatement);
    }
  }
  
  static func deleteQuery(queryStatement: OpaquePointer) {
    sqlite3_finalize(queryStatement)
  }
  
  // MARK: - Value conversion
  
  static func getColumnAsString(row: OpaquePointer?, index: Int32) -> String {
    if let c_string = sqlite3_column_text(row, index) {
      return String(cString: c_string);
    }
    return ("");
  }
  
  static func getColumnAsInt(row: OpaquePointer?, index: Int32) -> Int {
    guard let row = row else { return -1 }
    
    if sqlite3_column_type(row, index) == SQLITE_NULL {
      return 0
    }
    
    return Int(sqlite3_column_int(row, index));
  }
  
  static func getColumnAsInt64(row: OpaquePointer?, index: Int32) -> Int64 {
    guard let row = row else { return -1 }
    
    if sqlite3_column_type(row, index) == SQLITE_NULL {
      return 0
    }
    
    return sqlite3_column_int64(row, index);
  }
  
  static func getColumnAsBool(row: OpaquePointer?, index: Int32) -> Bool {
    guard let row = row else { return false }
    
    if sqlite3_column_type(row, index) == SQLITE_NULL {
      return false
    }

    return sqlite3_column_int(row, index) != 0
  }
  
  // MARK: - MMKV Initialization
  
  static func createMMKVStorage(id: String, encryptionKey: String) -> MMKV? {
    guard let rootDirectory = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupIdentifier)?.path else {
      return nil
    }
    
    MMKV.initialize(rootDir: rootDirectory);
    
    return MMKV(
      mmapID: id,
      cryptKey: encryptionKey.data(using: .utf8)!,
      mode: .readOnly
    )
  }
  
  // MARK: - MMKV Store
  
  static func getAccountStore() -> AccountStorageModel? {
    guard let mmkv = createMMKVStorage(id: "account-storage", encryptionKey: "3f64fc8d-472d-43d5-ba11-461020e2423b") else {
      return nil;
    }
    
    guard let data = mmkv.string(forKey: "account-storage") else { return nil }
    
    return try? JSONDecoder().decode(
      AccountStorageModel.self,
      from: data.data(using: .utf8)!
    )
  }
  
  // MARK: - Widget Entry Data
  
  static func getHomeworkForWeek(week: Date) -> [HomeworkModel] {
    // Calculate start and end of week
    let calendar = Calendar.current;
    guard let dateInterval = calendar.dateInterval(
      of: .weekOfYear,
      for: week
    ) else { return [] };
    
    let startOfWeek = calendar.startOfDay(for: dateInterval.start);
    let endOfWeek = calendar.startOfDay(for: dateInterval.end);
    
    let millisecondStartOfWeek = Int64(startOfWeek.timeIntervalSince1970 * 1000);
    let millisecondEndOfWeek = Int64(endOfWeek.timeIntervalSince1970 * 1000);
    
    if let db = openDatabase() {
      if let query = queryDatabase(query: "SELECT * FROM homework WHERE dueDate >= \(millisecondStartOfWeek) AND dueDate < \(millisecondEndOfWeek);", db: db) {
        var tasks: [HomeworkModel] = [];
        
        forEachRow(queryStatement: query) { row in
          tasks.append(
              HomeworkModel(
                createdByAccount: getColumnAsString(row: row, index: 1),
                kidName: getColumnAsString(row: row, index: 2),
                homeworkId: getColumnAsString(row: row, index: 3),
                subject: getColumnAsString(row: row, index: 4),
                content: getColumnAsString(row: row, index: 5),
                dueDate: getColumnAsInt64(row: row, index: 6),
                isDone: getColumnAsBool(row: row, index: 7),
                returnFormat: getColumnAsInt(row: row, index: 8),
                attachments: getColumnAsString(row: row, index: 9),
                evaluation: getColumnAsBool(row: row, index: 10),
                custom: getColumnAsBool(row: row, index: 11)
              )
            )
        }
        
        deleteQuery(queryStatement: query);
        
        return tasks;
      }
    }
    return [];
  }
  
  static func getSubjectCustomisation(subjectId: String) -> AccountStorageSubjectCustomisationModel {
    if let store = getAccountStore() {
      for account in store.state.accounts {
        if let customisation = account.customisation.subjects[subjectId.lowercased()] {
          return customisation;
        }
      }
    }
    return AccountStorageSubjectCustomisationModel(
      emoji: "🤓",
      name: "Unknown subject",
      color: "#000000"
    )
  }
}
