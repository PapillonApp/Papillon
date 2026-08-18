import SQLite3

struct Homework {
    @NativeDBField("id")
    var id: String
    @NativeDBField("homeworkId")
    var `homeworkId`: String
    @NativeDBField("subject")
    var `subject`: String
    @NativeDBField("content")
    var `content`: String
    @NativeDBField("dueDate")
    var `dueDate`: Int
    @NativeDBField("isDone")
    var `isDone`: Bool
    @NativeDBField("returnFormat")
    var `returnFormat`: Int
    @NativeDBField("attachments")
    var `attachments`: String?
    @NativeDBField("evaluation")
    var `evaluation`: Bool
    @NativeDBField("custom")
    var `custom`: Bool
    @NativeDBField("createdByAccount")
    var `createdByAccount`: String
    @NativeDBField("kidName")
    var `kidName`: String?
    
    init(_ query: OpaquePointer?) throws {
        try _id.load(query)
        try _homeworkId.load(query)
        try _subject.load(query)
        try _content.load(query)
        try _dueDate.load(query)
        try _isDone.load(query)
        try _returnFormat.load(query)
        try _attachments.load(query)
        try _evaluation.load(query)
        try _custom.load(query)
        try _createdByAccount.load(query)
        try _kidName.load(query)   
    }
    
    static func fetchAll() throws -> [Homework] {
        let db = NativeDB.shared;
        
        let statement = try db.query("SELECT * FROM homework")
        
        defer { db.freeQuery(statement) }
        
        var result: [Homework] = []
        
        while sqlite3_step(statement) == SQLITE_ROW {
            result.append(try Homework(statement))
        }
        
        return result
    }
}
