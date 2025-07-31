import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 11,
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
        { name: 'subject_id', type: 'string', isOptional: true },
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
        { name: 'subjectId', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'studentAverage', type: 'string' },
        { name: 'classAverage', type: 'string' },
        { name: 'maximum', type: 'string' },
        { name: 'minimum', type: 'string' },
        { name: 'outOf', type: 'string' },
        { name: 'periodGradeId', type: 'string', isOptional: true }
      ],
    }),
    tableSchema({
      name: 'homework',
      columns: [
        { name: 'homeworkId', type: 'string' },
        { name: 'subjectId', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'dueDate', type: 'number' },
        { name: 'isDone', type: 'boolean' },
        { name: 'returnFormat', type: 'number' },
        { name: "attachments", type: 'string', isOptional: true },
        { name: 'evaluation', type: 'boolean' },
        { name: 'custom', type: 'boolean' },
        { name: 'createdByAccount', type: "string" }
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
        { name: 'id', type: 'string' },
        { name: 'start', type: 'number' },
        { name: 'end', type: 'number' },
        { name: 'createdByAccount', type: "string" }
      ],
    }),
    tableSchema({
      name: 'grades',
      columns: [
        { name: 'createdByAccount', type: 'string' },
        { name: 'id', type: 'string' },
        { name: 'subjectId', type: 'string', isOptional: true },
        { name: 'description', type: 'string' },
        { name: 'givenAt', type: 'number' },
        { name: 'subjectFile', type: 'string', isOptional: true },
        { name: 'correctionFile', type: 'string', isOptional: true },
        { name: 'bonus', type: 'boolean', isOptional: true },
        { name: 'optional', type: 'boolean', isOptional: true },
        { name: 'outOf', type: 'number' },
        { name: 'coefficient', type: 'number' },
        { name: 'studentScore', type: 'number' },
        { name: 'averageScore', type: 'number' },
        { name: 'minScore', type: 'number' },
        { name: 'maxScore', type: 'number' }
      ],
    }),
    tableSchema({
      name: 'periodgrades',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'periodId', type: 'string' },
        { name: 'createdByAccount', type: 'string' },
        { name: 'studentOverall', type: 'string' },
        { name: 'classAverage', type: 'string' }
      ]
    }),
    tableSchema({
      name: "attendance",
      columns: [
        { name: 'id', type: 'string' },
        { name: 'createdByAccount', type: 'string' },
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
        { name: 'attendance_id', type: 'string' }
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
        { name: 'attendance_id', type: 'string' }
      ]
    }),
    tableSchema({
      name: "absences",
      columns: [
        { name: 'from', type: 'number' },
        { name: 'to', type: 'number' },
        { name: 'reason', type: 'string', isOptional: true },
        { name: 'justified', type: 'boolean' },
        { name: 'attendance_id', type: 'string' }
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
        { name: 'attendance_id', type: 'string' }
      ]
    }),
    tableSchema({
      name: "canteenmenus",
      columns: [
        { name: 'id', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'lunch', type: 'string', isOptional: true },
        { name: 'dinner', type: 'string', isOptional: true },
        { name: 'createdByAccount', type: 'string' }
      ]
    }),
    tableSchema({
      name: "chats",
      columns: [
        { name: 'id', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'recipient', type: 'string', isOptional: true },
        { name: 'creator', type: 'string', isOptional: true },
        { name: 'date', type: 'number' }
      ]
    }),
    tableSchema({
      name: "recipients",
      columns: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'class', type: 'string', isOptional: true },
        { name: 'chatId', type: 'string' }
      ]
    }),
    tableSchema({
      name: "messages",
      columns: [
        { name: 'id', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'attachments', type: 'string' },
        { name: 'chatId', type: 'string' }
      ]
    }),
  ],
});
