import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 7, // incremented version
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
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
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
      ],
    }),
  ],
});
