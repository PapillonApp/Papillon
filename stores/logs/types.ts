export interface LogsStorage {
    logs: Log[]
    addItem: (log: Log) => void;
}

export interface Log {
    date: string,
    message: string,
    type: "LOG" | "WARN" | "ERROR" | "INFO"
}