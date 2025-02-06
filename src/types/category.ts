export interface Category {
  id: number;
  name: string;
  price: number;
  surcharge: number;
  [key: string]: string | number;
} 