import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import logger from '@nozbe/watermelondb/utils/common/logger';

// WatermelonDB's internal work-queue diagnostics ("Enqueued writer",
// "can't be performed yet, because there are N other readers/writers...")
// are purely informational dev-mode noise, not error reporting — our own
// database/utils/safeTransaction.ts handles real failure logging separately.
logger.silence();
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { Absence, Attendance, Delay, Observation, Punishment } from '@/database/models/Attendance';
import CanteenMenu from '@/database/models/CanteenMenu';
import { Chat, Message, Recipient } from '@/database/models/Chat';
import Event from '@/database/models/Event';
import { Grade, Period, PeriodGrades } from '@/database/models/Grades';
import Homework from "@/database/models/Homework";
import Ical from '@/database/models/Ical';
import News from '@/database/models/News';
import Subject from '@/database/models/Subject';
import Course from '@/database/models/Timetable';

import { Balance } from './models/Balance';
import CanteenHistoryItem from './models/CanteenHistory';
import Kid from './models/Kid';
import { mySchema } from './schema';

const appGroupId = 'group.xyz.getpapillon.ios';
const databaseFilename = 'watermelon.db';

function resolveSharedDbName(): string | undefined {
  if (Platform.OS !== 'ios') return undefined;

  const sharedContainer = Paths.appleSharedContainers[appGroupId];
  if (!sharedContainer) return undefined;

  const sharedFile = new File(sharedContainer, databaseFilename);
  const legacyFile = new File(Paths.document, databaseFilename);

  if (!sharedFile.exists && legacyFile.exists) {
    legacyFile.copySync(sharedFile);
  }

  return sharedFile.uri;
}

const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: resolveSharedDbName(),
});

export const database = new Database({
  adapter,
  modelClasses: [
    Event,
    Ical,
    Subject, 
    Homework,
    News,
    Period,
    Grade,
    PeriodGrades,
    Attendance,
    Delay,
    Observation,
    Absence,
    Punishment,
    CanteenMenu,
    Chat,
    Message,
    Recipient,
    Course,
    Kid,
    Balance,
    CanteenHistoryItem
  ],
});
