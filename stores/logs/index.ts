import { create } from 'zustand'

import { Log, LogsStorage, NetworkStorage } from './types'

export const useLogStore = create<LogsStorage>((set, get) => ({
  logs: [],
  addItem: (log: Log) => set({ logs: [...get().logs, log] })
}))

const sanitizeUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);
  return `${url.protocol}//${url.host}`;
};

export const useNetworkStore = create<NetworkStorage>((set, get) => ({
  hosts: new Map(),
  addRequest: (request: Request, uuid: string) => {
    const url = sanitizeUrl(request.url)
    const hosts = get().hosts;

    if (!hosts.has(url)) {
      hosts.set(url, { requests: [], responses: [] });
    }

    hosts.get(url)!.requests.push({ [uuid]: request });

    set({ hosts: new Map(hosts) });
  },
  addResponse: (response: Response, uuid: string) => {
    const url = sanitizeUrl(response.url)
    const hosts = get().hosts;
    if (!hosts.has(url)) {
      hosts.set(url, { requests: [], responses: [] });
    }
    hosts.get(url)!.responses.push({ [uuid]: response });
    set({ hosts: new Map(hosts) });
  }
}))