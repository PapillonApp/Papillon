import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import logger from '@nozbe/watermelondb/utils/common/logger';

// WatermelonDB's internal work-queue diagnostics ("Enqueued writer",
// "can't be performed yet, because there are N other readers/writers...")
// are purely informational dev-mode noise, not error reporting — our own
// database/utils/safeTransaction.ts handles real failure logging separately.
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

// Build desktop (web via react-native-web) : le SQLiteAdapter natif de
// WatermelonDB repose sur better-sqlite3 (binaire Node.js) et n'existe pas
// dans un navigateur / WebView — c'est ce qui casse le bundling web. On
// utilise donc ici l'adaptateur officiellement supporté par WatermelonDB
// pour le web : LokiJSAdapter, persisté dans IndexedDB.
// - useWebWorker: false → un seul contexte (WebView Tauri), plus simple à
//   débugger et évite d'avoir à configurer Metro pour spawn un worker.
// - useIncrementalIndexedDB: true → adaptateur IndexedDB recommandé par
//   WatermelonDB (plus rapide, écritures incrémentales).
const adapter = new LokiJSAdapter({
  schema: mySchema,
  dbName: 'papillon_web',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onQuotaExceededError: (error) => {
    // eslint-disable-next-line no-console
    console.error('[database] Quota IndexedDB dépassé :', error);
  },
  onSetUpError: (error) => {
    // eslint-disable-next-line no-console
    console.error('[database] Échec d\'initialisation de la base locale :', error);
  },
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
