import React from "react";

export type ListTouchableBlockPressController = {
  block: () => void;
  unblock: () => void;
};

export const ListTouchableBlockPressContext = React.createContext<ListTouchableBlockPressController | null>(null);
