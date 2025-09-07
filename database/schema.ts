import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 30,
  tables: [
    tableSchema({
      name: 'events',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'start', type: 'number' },
        { name: 'end', type: 'number' },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'room', type: 'string', isOptional: true },
        { name: 'teacher', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true },
        { name: 'canceled', type: 'boolean', isOptional: true },
        { name: 'readonly', type: 'boolean', isOptional: true },
        { name: 'subject_id', type: 'string', isOptional: true, isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'icals',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'lastupdated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'subjects',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'subjects', type: 'string' },
        { name: 'studentAverage', type: 'string' },
        { name: 'classAverage', type: 'string' },
        { name: 'maximum', type: 'string' },
        { name: 'minimum', type: 'string' },
        { name: 'outOf', type: 'string' },
        { name: 'periodGradeId', type: 'string', isOptional: true, isIndexed: true }
      ],
    }),
    tableSchema({
      name: 'homework',
      columns: [
        { name: 'homeworkId', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'dueDate', type: 'number' },
        { name: 'isDone', type: 'boolean' },
        { name: 'returnFormat', type: 'number' },
        { name: "attachments", type: 'string', isOptional: true },
        { name: 'evaluation', type: 'boolean' },
        { name: 'custom', type: 'boolean' },
        { name: 'createdByAccount', type: "string" },
        { name: 'kidName', type: "string", isOptional: true }
      ],
    }),
    tableSchema({
      name: 'news',
      columns: [
        { name: 'newsId', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'createdAt', type: 'number' },
        { name: 'acknowledged', type: 'boolean' },
        { name: "attachments", type: 'string', isOptional: true },
        { name: 'content', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'createdByAccount', type: "string" }
      ],
    }),
    tableSchema({
      name: 'periods',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'periodId', type: 'string' },
        { name: 'start', type: 'number' },
        { name: 'end', type: 'number' },
        { name: 'createdByAccount', type: "string" },
        { name: 'kidName', type: "string", isOptional: true }
      ],
    }),
    tableSchema({
      name: 'grades',
      columns: [
        { name: 'createdByAccount', type: 'string' },
        { name: 'gradeId', type: 'string' },
        { name: 'subjectName', type: 'string' },
        { name: 'subjectId', type: 'string', isOptional: true },
        { name: 'description', type: 'string' },
        { name: 'givenAt', type: 'number' },
        { name: 'subjectFile', type: 'string', isOptional: true },
        { name: 'correctionFile', type: 'string', isOptional: true },
        { name: 'bonus', type: 'boolean', isOptional: true },
        { name: 'optional', type: 'boolean', isOptional: true },
        { name: 'coefficient', type: 'number' },
        { name: 'outOf', type: 'string' },
        { name: 'studentScore', type: 'string' },
        { name: 'averageScore', type: 'string' },
        { name: 'minScore', type: 'string' },
        { name: 'maxScore', type: 'string' }
      ],
    }),
    tableSchema({
      name: 'periodgrades',
      columns: [
        { name: 'periodGradeId', type: 'string' },
        { name: 'periodId', type: 'string', isIndexed: true },
        { name: 'createdByAccount', type: 'string' },
        { name: 'studentOverall', type: 'string' },
        { name: 'classAverage', type: 'string' }
      ]
    }),
    tableSchema({
      name: "attendance",
      columns: [
        { name: "attendanceId", type: 'string' },
        { name: 'createdByAccount', type: 'string' },
        { name: 'kidName', type: 'string', isOptional: true },
        { name: 'period', type: 'string' }
      ]
    }),
    tableSchema({
      name: "delays",
      columns: [
        { name: 'givenAt', type: 'number' },
        { name: 'reason', type: 'string', isOptional: true },
        { name: 'justified', type: 'boolean' },
        { name: 'duration', type: 'number' },
        { name: 'attendanceId', type: 'string', isIndexed: true },
        { name: 'kidName', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: "observations",
      columns: [
        { name: 'givenAt', type: 'number' },
        { name: 'sectionName', type: 'string' },
        { name: 'sectionType', type: 'string' },
        { name: 'subjectName', type: 'string', isOptional: true },
        { name: 'shouldParentsJustify', type: 'boolean' },
        { name: 'reason', type: 'string' },
        { name: 'attendanceId', type: 'string', isIndexed: true }
      ]
    }),
    tableSchema({
      name: "absences",
      columns: [
        { name: 'from', type: 'number' },
        { name: 'to', type: 'number' },
        { name: 'reason', type: 'string', isOptional: true },
        { name: 'justified', type: 'boolean' },
        { name: 'attendanceId', type: 'string', isIndexed: true },
        { name: 'kidName', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: "punishments",
      columns: [
        { name: 'givenAt', type: 'number' },
        { name: 'givenBy', type: 'string' },
        { name: 'exclusion', type: 'boolean' },
        { name: 'duringLesson', type: 'boolean' },
        { name: 'nature', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'homeworkDocumentsRaw', type: 'string' },
        { name: 'reasonDocumentsRaw', type: 'string' },
        { name: 'homeworkText', type: 'string' },
        { name: 'reasonText', type: 'string' },
        { name: 'reasonCircumstances', type: 'string' },
        { name: 'attendanceId', type: 'string', isIndexed: true }
      ]
    }),
    tableSchema({
      name: "canteenmenus",
      columns: [
        { name: 'menuId', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'lunch', type: 'string', isOptional: true },
        { name: 'dinner', type: 'string', isOptional: true },
        { name: 'createdByAccount', type: 'string' }
      ]
    }),
    tableSchema({
      name: "chats",
      columns: [
        { name: 'chatId', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'recipient', type: 'string', isOptional: true },
        { name: 'creator', type: 'string', isOptional: true },
        { name: 'date', type: 'number' },
        { name: 'createdByAccount', type: 'string' }
      ]
    }),
    tableSchema({
      name: "recipients",
      columns: [
        { name: 'recipientId', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'class', type: 'string', isOptional: true },
        { name: 'chatId', type: 'string', isIndexed: true }
      ]
    }),
    tableSchema({
      name: "messages",
      columns: [
        { name: 'messageId', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'attachments', type: 'string' },
        { name: 'chatId', type: 'string', isIndexed: true }
      ]
    }),
    tableSchema({
      name: "courses",
      columns: [
        { name: 'createdByAccount', type: 'string' },
        { name: 'kidName', type: 'string', isOptional: true },
        { name: 'courseId', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'type', type: 'number' },
        { name: 'from', type: 'number' },
        { name: 'to', type: 'number' },
        { name: 'additionalInfo', type: 'string', isOptional: true },
        { name: 'room', type: 'string', isOptional: true },
        { name: 'teacher', type: 'string', isOptional: true },
        { name: 'group', type: 'string', isOptional: true },
        { name: 'backgroundColor', type: 'string', isOptional: true },
        { name: 'status', type: 'number', isOptional: true },
        { name: 'customStatus', type: 'string', isOptional: true },
        { name: 'url', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: "kids",
      columns:[
        { name: 'createdByAccount', type: 'string' },
        { name: 'kidId', type: 'string' },
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'class', type: 'string' },
        { name: 'dateOfBirth', type: 'number' },
      ]
    }),
    tableSchema({
      name: "balances",
      columns: [
        { name: 'createdByAccount', type: 'string' },
        { name: 'balanceId', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'lunchRemaining', type: 'number' },
        { name: 'lunchPrice', type: 'number' },
        { name: 'label', type: 'string' }
      ]
    }),
    tableSchema({
      name: "canteentransactions",
      columns: [
        { name: 'createdByAccount', type: 'string' },
        { name: 'transactionId', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'label', type: 'string' },
        { name: 'currency', type: 'string' },
        { name: 'amount', type: 'number' },
      ]
    })
  ],
});
