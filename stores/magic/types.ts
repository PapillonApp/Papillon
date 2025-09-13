export interface MagicStorage {
    processHomeworks: Item[]
    getHomework: (id: string) => Item | undefined;
    addHomework: (homework: Item) => void;
    clear: () => void;
}

export interface Item {
  id: string,
  label: string
}