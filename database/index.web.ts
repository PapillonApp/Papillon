import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import logger from '@nozbe/watermelondb/utils/common/logger';

// Same rationale as the native database/index.ts: these are diagnostic logs,
// not errors — keep them silenced.
logger.silence();

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

// WatermelonDB's SQLiteAdapter needs either the native JSI binding (mobile)
// or Node's better-sqlite3 (a real Node process). Neither exists inside a
// browser/Electron renderer, and Expo Router's static export also evaluates
// this module once in a plain Node.js SSR pass, which has no `indexedDB`
// either. So: build the real adapter only once we can see a browser-like
// global, and hand the SSR pass an inert stand-in it will never actually
// query (the prerendered shell doesn't read from the database).
const hasBrowserStorage = typeof indexedDB !== "undefined";

function buildDatabase(): Database {
  if (!hasBrowserStorage) {
    // SSR pass: nothing will read/write this instance before the real,
    // client-side module evaluation replaces it in the browser.
    return new Database({
      adapter: new LokiJSAdapter({ schema: mySchema, dbName: "papillon-ssr" }),
      modelClasses: [
        Event, Ical, Subject, Homework, News, Period, Grade, PeriodGrades,
        Attendance, Delay, Observation, Absence, Punishment, CanteenMenu,
        Chat, Message, Recipient, Course, Kid, Balance, CanteenHistoryItem,
      ],
    });
  }

  const adapter = new LokiJSAdapter({
    schema: mySchema,
    // Recommended by WatermelonDB for production web/Electron use: chunked
    // reads/writes against IndexedDB instead of re-serializing the whole DB.
    useIncrementalIndexedDB: true,
    // Keeping this off trades a little throughput for predictable behaviour
    // when this bundle is loaded from a packaged file:// build — worth
    // revisiting once the desktop build is stable.
    useWebWorker: false,
    onQuotaExceededError: (error: Error) => {
      console.error("[WatermelonDB] Quota IndexedDB dépassé:", error);
    },
    onSetUpError: (error: Error) => {
      console.error("[WatermelonDB] Échec d'initialisation:", error);
    },
  });

  return new Database({
    adapter,
    modelClasses: [
      Event, Ical, Subject, Homework, News, Period, Grade, PeriodGrades,
      Attendance, Delay, Observation, Absence, Punishment, CanteenMenu,
      Chat, Message, Recipient, Course, Kid, Balance, CanteenHistoryItem,
    ],
  });
}

export const database = buildDatabase();
