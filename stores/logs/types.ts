export interface LogsStorage {
    logs: string[]
    addItem: (log: string) => void;
}