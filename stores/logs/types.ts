export interface LogsStorage {
    logs: Log[]
    addItem: (log: Log) => void;
}

export interface Log {
    date: string,
    message: string,
    type: LogType
    from?: string,
}

export enum LogType {
    LOG = "LOG",
    WARN = "WARN",
    ERROR = "ERROR",
    INFO = "INFO"
}

export interface NetworkStorage {
    hosts: Map<string, Host>
    addRequest: (request: Request, uuid: string) => void;
    addResponse: (response: Response, uuid: string) => void;
}

export type Host = {
    requests: Record<string, Request>[],
    responses: Record<string, Response>[]
}