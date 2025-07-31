export interface Delay {
  id: string;
  timestamp: number;

  /** Duration in minutes. */
  duration: number;

  justified: boolean;
  justification?: string | null;
  reasons?: string;
}
