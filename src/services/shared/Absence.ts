export interface Absence {
  id: string;

  fromTimestamp: number;
  toTimestamp: number;

  justified: boolean;
  hours: string;
  administrativelyFixed: boolean;
  reasons?: string;
}
