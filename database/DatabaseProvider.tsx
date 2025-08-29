import { Database, Q } from "@nozbe/watermelondb";
import React, { createContext, useContext } from 'react';

import { database } from './index';
import { error } from "@/utils/logger/logger";
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