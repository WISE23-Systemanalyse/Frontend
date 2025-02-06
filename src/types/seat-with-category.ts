import { Category } from "./category";

export interface SeatWithCategory {
  id: number;
  row_number: number;
  seat_number: number;
  hall_id: number;
  category_id: number;
  category: Category;
} 