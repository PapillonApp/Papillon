import { Database, Q } from "@nozbe/watermelondb";
import React, { createContext, useContext } from 'react';

import { database } from './index';
import { error } from "@/utils/logger/logger";
import Subject from "./models/Subject";
import Homework from "./models/Homework";
import News from "./models/News";
import { Grade, Period, PeriodGrades } from "./models/Grades";
import { Absence, Attendance, Delay, Observation, Punishment } from "./models/Attendance";
import CanteenMenu from "./models/CanteenMenu";
import { Chat, Message, Recipient } from "./models/Chat";
import Course from "./models/Timetable";
import Kid from "./models/Kid";
import { Balance } from "./models/Balance";
import CanteenHistoryItem from "./models/CanteenHistory";
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

  await db.write(async () => {
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
  });
}

export async function removeAllDuplicates() {
  const db = getDatabaseInstance();
  await db.write(async () => {
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

    for (const [tableName, keyFn] of Object.entries(uniqueKeys)) {
      const collection = db.collections.get(tableName);
      const all = await collection.query().fetch();
      const seen = new Map();
      const duplicates = [];

      for (const record of all) {
        const key = keyFn(record as any);
        if (seen.has(key)) {
          duplicates.push(record);
        } else {
          seen.set(key, record);
        }
      }

      if (duplicates.length) {
        await Promise.all(duplicates.map(d => d.markAsDeleted()));
      }
    }
  });
}