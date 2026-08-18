//
//  NativeDBError.swift
//  MyApp
//
//  Created by Rémy Godet on 16/08/2026.
//

import Foundation


enum NativeDBError: Error, LocalizedError {
    case openFailed(String)
    case invalidQuery(String)
    case invalidRow
    case invalidValue(String)
    case missingColumn(String)
}
