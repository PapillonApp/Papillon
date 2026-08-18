//
//  NativeDB.swift
//  Papillon
//
//  Created by Rémy Godet on 15/08/2026.
//

import Foundation
import SQLite3

final class NativeDB {
    private let appGroupId: String = NativeDBConstants().appGroupId
    private let filename: String = NativeDBConstants().filename
    
    var databasePath: URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupId)?
            .appendingPathComponent(filename)
    }
    
    private var handler: OpaquePointer?
    
    static let shared: NativeDB = {
        do {
            return try NativeDB()
        } catch {
            fatalError("Failed to initialize NativeDB: \(error)")
        }
    }()
    
    private init() throws {
        guard let databasePath = databasePath else {
            throw NativeDBError.openFailed("Failed to access to database path.")
        }
        
        if FileManager.default.fileExists(atPath: databasePath.path) != true {
            throw NativeDBError.openFailed("Database does not exist.")
        }
        
        let result = sqlite3_open(databasePath.path, &self.handler)
        
        guard result == SQLITE_OK else {
            let message = handler.map { String(cString: sqlite3_errmsg($0)) } ?? "Unable to open database"
            sqlite3_close(handler)
            throw NativeDBError.openFailed(message)
        }
    }
    
    func query(_ query: String) throws -> OpaquePointer? {
        var statement: OpaquePointer?
        
        guard sqlite3_prepare_v2(self.handler, query, -1, &statement, nil) == SQLITE_OK else {
            throw NativeDBError.invalidQuery(String(cString: sqlite3_errmsg(self.handler)))
        }
        
        return statement;
    }
    
    func freeQuery(_ query: OpaquePointer?) {
        sqlite3_finalize(query);
    }
    
    deinit {
        guard let handler else { return }
        sqlite3_close(handler)
    }
}
