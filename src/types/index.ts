export * from './show';
export * from './movie';
export * from './seat';

export interface Seat {
  [x: string]: any;
  id: number;
  hall_id: number;
  row_number: number;
  seat_number: number;
  category_id: number;
  seat_status?: string;
}

export interface Category {
  id: number;
  category_name: string;
  surcharge: number;
}