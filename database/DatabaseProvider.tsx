import React, { createContext, useContext } from 'react';
import { database } from './index';

const DatabaseContext = createContext(database);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => (
  <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>
);

export const useDatabase = () => useContext(DatabaseContext);
