import { Database, Q } from "@nozbe/watermelondb";
import React, { createContext, useContext } from 'react';

import { error, info } from "@/utils/logger/logger";

import { database } from './index';
import { Absence, Attendance, Delay, Observation, Punishment } from "./models/Attendance";
import { Balance } from "./models/Balance";
import CanteenHistoryItem from "./models/CanteenHistory";
import CanteenMenu from "./models/CanteenMenu";
import { Chat, Message, Recipient } from "./models/Chat";
import { Grade, Period } from "./models/Grades";
import Homework from "./models/Homework";
import Kid from "./models/Kid";
import News from "./models/News";
import Subject from "./models/Subject";
import Course from "./models/Timetable";
import { batchOperations, safeWrite } from "./utils/safeTransaction";
const _db: Database = database;

export const getDatabaseInstance = (): Database => _db;
const DatabaseContext = createContext(database);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => (
  <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>
);

export const useDatabase = () => useContext(DatabaseContext);

export async function ClearDatabaseForAccount(accountId: string) {
  const db = getDatabaseInstance();
  const tablesWithAccount = [
    "homework",
    "news",
    "periods",
    "grades",
    "periodgrades",
    "attendance",
    "canteenmenus",
    "chats",
    "courses",
    "kids",
    "balances",
    "canteentransactions",
  ];

  await safeWrite(db, async () => {
    for (const table of tablesWithAccount) {
      try {
        const collection = db.get(table);
        const records = await collection
          .query(Q.where("createdByAccount", accountId))
          .fetch();

        if (records.length > 0) {
          await Promise.all(records.map((record) => record.markAsDeleted()));
          await Promise.all(records.map((record) => record.destroyPermanently()));
        }
      } catch (err) {
        error(String(err))
      }
    }
  }, 10000, 'ClearDatabaseForAccount');
}

export async function removeAllDuplicates() {
  const db = getDatabaseInstance();

  try {
    const uniqueKeys = {
      subjects: (r: Subject) => `${r.name}-${r.periodGradeId || ''}`,
      homework: (r: Homework) => r.homeworkId,
      news: (r: News) => r.newsId,
      periods: (r: Period) => r.periodId,
      grades: (r: Grade) => r.gradeId,
      attendance: (r: Attendance) => r.attendanceId,
      delays: (r: Delay) => `${r.attendanceId}-${r.givenAt}`,
      observations: (r: Observation) => `${r.attendanceId}-${r.givenAt}`,
      absences: (r: Absence) => `${r.attendanceId}-${r.from}-${r.to}`,
      punishments: (r: Punishment) => `${r.attendanceId}-${r.givenAt}`,
      canteenmenus: (r: CanteenMenu) => r.menuId,
      chats: (r: Chat) => r.chatId,
      recipients: (r: Recipient) => r.recipientId,
      messages: (r: Message) => r.messageId,
      courses: (r: Course) => r.courseId,
      kids: (r: Kid) => r.kidId,
      balances: (r: Balance) => r.balanceId,
      canteentransactions: (r: CanteenHistoryItem) => r.transactionId,
    };
    let totalDuplicatesFound = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allDuplicatesToDelete: any[] = [];
    for (const [tableName, keyFn] of Object.entries(uniqueKeys)) {
      const tableDuplicates = await findTableDuplicates(db, tableName, keyFn);
      if (tableDuplicates.length > 0) {
        allDuplicatesToDelete.push(...tableDuplicates);
        totalDuplicatesFound += tableDuplicates.length;
      }
    }

    if (allDuplicatesToDelete.length > 0) {

      await safeWrite(db, async () => {
        const batches = batchOperations(allDuplicatesToDelete, 100);

        for (const batch of batches) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await Promise.all(batch.map((record: any) => record.markAsDeleted()));
        }
      }, 120000, 'removeAllDuplicates');

      info(`🍉 Duplicate removal completed successfully`);
    } else {
      info("🍉 No duplicates found");
    }

  } catch (err) {
    error(`Failed to remove duplicates: ${err}`);
    throw err;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findTableDuplicates(db: Database, tableName: string, keyFn: (record: any) => string): Promise<any[]> {
  try {
    const collection = db.collections.get(tableName);
    const all = await collection.query().fetch();
    const seen = new Map();
    const duplicates = [];

    for (const record of all) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const key = keyFn(record as any);
      if (seen.has(key)) {
        duplicates.push(record);
      } else {
        seen.set(key, record);
      }
    }

    return duplicates;
  } catch (err) {
    error(`Failed to process table ${tableName}: ${err}`);
    return [];
  }
}