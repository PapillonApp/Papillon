import { RouteParameters } from "@/router/helpers/types";

export interface Anecdote {
  title: string;
  content: string;
  onClick: {
    stack: "AccountStack" | "SettingStack" | undefined;
    page: RouteParameters;
  };
};
