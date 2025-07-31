import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Homework from "@/database/models/Homework";

import { Absence, Attendance, Delay, Observation, Punishment } from './models/Attendance';
import CanteenMenu from './models/CanteenMenu';
import Event from './models/Event';
import { Grade, Period, PeriodGrades } from './models/Grades';
import Ical from './models/Ical';
import News from './models/News';
import Subject from './models/Subject';
import { mySchema } from './schema';

const adapter = new SQLiteAdapter({
  schema: mySchema,
});

export const database = new Database({
  adapter,
  modelClasses: [Event, Ical, Subject, Homework, News, Period, Grade, PeriodGrades, Attendance, Delay, Observation, Absence, Punishment, CanteenMenu],
});
