//
//  NativeDBField.swift
//  MyApp
//
//  Created by Rémy Godet on 16/08/2026.
//

import SQLite3

@propertyWrapper
struct NativeDBField<T: NativeDBValue> {
    let column: String
    var wrappedValue: T
    
    init(_ column: String) {
        self.column = column
        self.wrappedValue = T()
    }
    
    mutating func load(_ row: OpaquePointer?) throws {
        guard let row else { throw NativeDBError.invalidRow }
        
        let columnLength = sqlite3_column_count(row)
        
        for i in 0..<columnLength {
            guard let name = sqlite3_column_name(row, i),
                  String(cString: name) == column else { continue }
            
            let value: T? = T.fromDB(row, i)
            
            if !(T.self is NativeDBOptionalValue.Type) && value == nil {
                throw NativeDBError.invalidValue("Column \"\(self.column)\" sent nil to an non optional value.")
            }
            
            wrappedValue = value!
            return
        }
        
        throw NativeDBError.missingColumn("Missing column \"\(self.column)\" in row.")
    }
}
