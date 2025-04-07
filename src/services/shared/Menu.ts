import { FoodAllergen, FoodLabel } from "pawnote";

export interface Menu {
  date: Date
  lunch?: {
    entry?: FoodItem[]
    main?: FoodItem[]
    side?: FoodItem[]
    cheese?: FoodItem[]
    dessert?: FoodItem[]
    drink?: FoodItem[]
  },
  dinner?: {
    entry?: FoodItem[]
    main?: FoodItem[]
    side?: FoodItem[]
    cheese?: FoodItem[]
    dessert?: FoodItem[]
    drink?: FoodItem[]
  }
}

export interface FoodItem {
  name: string
  allergens?: FoodAllergen[]
  labels?: FoodLabel[]
}