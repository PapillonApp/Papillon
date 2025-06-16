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