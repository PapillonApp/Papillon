//
//  NativeDBValue.swift
//  MyApp
//
//  Created by Rémy Godet on 16/08/2026.
//

import SQLite3

protocol NativeDBValue {
    init()
    static func fromDB(_ row: OpaquePointer?, _ index: Int32) -> Self?
}

protocol NativeDBOptionalValue {
    static var isOptional: Bool { get }
}

extension String: NativeDBValue {
    static func fromDB(_ row: OpaquePointer?, _ index: Int32) -> String? {
        if let c_string = sqlite3_column_text(row, index) {
            return String(cString: c_string);
        }
        return nil;
    }
}

extension Int: NativeDBValue {
    static func fromDB(_ row: OpaquePointer?, _ index: Int32) -> Int? {
        guard let row = row else { return nil }
        
        if sqlite3_column_type(row, index) == SQLITE_NULL {
            return nil
        }
        
        return Int(sqlite3_column_int(row, index));
    }
}

extension Bool: NativeDBValue {
    static func fromDB(_ row: OpaquePointer?, _ index: Int32) -> Bool? {
        guard let row = row else { return nil }
        
        if sqlite3_column_type(row, index) == SQLITE_NULL {
            return nil
        }
        
        return sqlite3_column_int(row, index) != 0;
    }
}

extension Optional: NativeDBValue where Wrapped: NativeDBValue {
    init() { self = nil }

    static func fromDB(_ row: OpaquePointer?, _ index: Int32) -> Wrapped?? {
        if sqlite3_column_type(row, index) == SQLITE_NULL {
            return .some(nil)
        }
        return .some(Wrapped.fromDB(row, index))
    }
}

extension Optional: NativeDBOptionalValue {
    static var isOptional: Bool { true }
}
