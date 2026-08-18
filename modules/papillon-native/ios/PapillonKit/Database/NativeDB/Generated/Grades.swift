import SQLite3

struct Grades {
    @NativeDBField("id")
    var id: String
    @NativeDBField("createdByAccount")
    var `createdByAccount`: String
    @NativeDBField("gradeId")
    var `gradeId`: String
    @NativeDBField("subjectName")
    var `subjectName`: String
    @NativeDBField("subjectId")
    var `subjectId`: String?
    @NativeDBField("description")
    var `description`: String
    @NativeDBField("givenAt")
    var `givenAt`: Int
    @NativeDBField("subjectFile")
    var `subjectFile`: String?
    @NativeDBField("correctionFile")
    var `correctionFile`: String?
    @NativeDBField("bonus")
    var `bonus`: Bool?
    @NativeDBField("optional")
    var `optional`: Bool?
    @NativeDBField("coefficient")
    var `coefficient`: Int
    @NativeDBField("outOf")
    var `outOf`: String
    @NativeDBField("studentScore")
    var `studentScore`: String
    @NativeDBField("averageScore")
    var `averageScore`: String
    @NativeDBField("minScore")
    var `minScore`: String
    @NativeDBField("maxScore")
    var `maxScore`: String
    
    init(_ query: OpaquePointer?) throws {
        try _id.load(query)
        try _createdByAccount.load(query)
        try _gradeId.load(query)
        try _subjectName.load(query)
        try _subjectId.load(query)
        try _description.load(query)
        try _givenAt.load(query)
        try _subjectFile.load(query)
        try _correctionFile.load(query)
        try _bonus.load(query)
        try _optional.load(query)
        try _coefficient.load(query)
        try _outOf.load(query)
        try _studentScore.load(query)
        try _averageScore.load(query)
        try _minScore.load(query)
        try _maxScore.load(query)   
    }
    
    static func fetchAll() throws -> [Grades] {
        let db = NativeDB.shared;
        
        let statement = try db.query("SELECT * FROM grades")
        
        defer { db.freeQuery(statement) }
        
        var result: [Grades] = []
        
        while sqlite3_step(statement) == SQLITE_ROW {
            result.append(try Grades(statement))
        }
        
        return result
    }
}
