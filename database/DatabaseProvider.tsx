import React, { createContext, useContext } from 'react';
import { database } from './index';
import { Database } from "@nozbe/watermelondb";
const _db: Database = database;

export const getDatabaseInstance = (): Database => _db;
const DatabaseContext = createContext(database);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => (
  <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>
);

export const useDatabase = () => useContext(DatabaseContext);
