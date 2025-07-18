export interface CanteenMenu {
  date: Date;
  lunch?: Meal;
  dinner?: Meal;
}

export interface Meal {
  entry: Food[];
  main?: Food[];
  side?: Food[];
  cheese?: Food[];
  dessert?: Food[];
  drink?: Food[];
}

export interface Food {
  name: string;
  allergens?: string[];
}