export type Instance = {
  id: string;
  name: string;
  casurl?: string;
};

export type User = {
  token: string;
  firstname?: string;
  lastname?: string;
  program?: string;
  department?: string;
  refreshToken?: string;
};

export type Lesson = {
  uid?: string;
  dtstart: string;
  dtend: string;
  summary?: string;
  description?: string;
  locations?: string[];
  location?: string;
};

export type NewsFeed = {
  title: string;
  content?: string;
  start: string;
  url: string;
  picture?: string;
  type?: string;
};

export const INSTANCES: Instance[];

export function loginWithCredentials(
  instanceId: string,
  username: string,
  password: string
): Promise<User>;

export function loginWithOAuth(instanceId: string, code: string): Promise<User>;

export function refreshOAuthTokenWithUser(
  instanceId: string,
  refreshToken: string
): Promise<User>;

export function getPlanning(instanceId: string, token: string): Promise<Lesson[]>;

export function getNewsFeed(instanceId: string): Promise<NewsFeed[]>;

export function getCASURL(instanceId: string): string;
