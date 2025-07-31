export interface Balance {
  amount: number;
  currency: string;
  remaining: number | null;
  price?: number;
  label: string;
}
