import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Homework from "@/database/models/Homework";

import Event from './models/Event';
import Ical from './models/Ical';
import News from './models/News';
import Subject from './models/Subject';
import { mySchema } from './schema';

const adapter = new SQLiteAdapter({
  schema: mySchema,
});

export const database = new Database({
  adapter,
  modelClasses: [Event, Ical, Subject, Homework, News],
});
