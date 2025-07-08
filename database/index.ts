import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';
import Event from './models/Event';
import Ical from './models/Ical';
import Subject from './models/Subject';

const adapter = new SQLiteAdapter({
  schema: mySchema,
});

export const database = new Database({
  adapter,
  modelClasses: [Event, Ical, Subject],
});
