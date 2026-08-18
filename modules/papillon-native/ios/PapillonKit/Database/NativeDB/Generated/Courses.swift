import SQLite3

struct Courses {
    @NativeDBField("id")
    var id: String
    @NativeDBField("createdByAccount")
    var `createdByAccount`: String
    @NativeDBField("kidName")
    var `kidName`: String?
    @NativeDBField("courseId")
    var `courseId`: String
    @NativeDBField("subject")
    var `subject`: String
    @NativeDBField("type")
    var `type`: Int
    @NativeDBField("from")
    var `from`: Int
    @NativeDBField("to")
    var `to`: Int
    @NativeDBField("additionalInfo")
    var `additionalInfo`: String?
    @NativeDBField("room")
    var `room`: String?
    @NativeDBField("teacher")
    var `teacher`: String?
    @NativeDBField("group")
    var `group`: String?
    @NativeDBField("backgroundColor")
    var `backgroundColor`: String?
    @NativeDBField("status")
    var `status`: Int?
    @NativeDBField("customStatus")
    var `customStatus`: String?
    @NativeDBField("url")
    var `url`: String?
    
    init(_ query: OpaquePointer?) throws {
        try _id.load(query)
        try _createdByAccount.load(query)
        try _kidName.load(query)
        try _courseId.load(query)
        try _subject.load(query)
        try _type.load(query)
        try _from.load(query)
        try _to.load(query)
        try _additionalInfo.load(query)
        try _room.load(query)
        try _teacher.load(query)
        try _group.load(query)
        try _backgroundColor.load(query)
        try _status.load(query)
        try _customStatus.load(query)
        try _url.load(query)   
    }
    
    static func fetchAll() throws -> [Courses] {
        let db = NativeDB.shared;
        
        let statement = try db.query("SELECT * FROM courses")
        
        defer { db.freeQuery(statement) }
        
        var result: [Courses] = []
        
        while sqlite3_step(statement) == SQLITE_ROW {
            result.append(try Courses(statement))
        }
        
        return result
    }
}
