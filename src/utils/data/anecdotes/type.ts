import { RouteParameters } from "@/router/helpers/types";

export interface Anecdote {
  type: "new" | "info";
  content: string;
  onClick: {
    stack: "AccountStack" | "SettingStack" | undefined;
    page: RouteParameters;
  };
};
