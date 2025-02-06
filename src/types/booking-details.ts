export interface BookingDetails {
  show: any;
  id: number;
  show_id: number;
  user_id: string;
  seat_id: number;
  payment_id: string;
  token: string;
  seat?: {
    row_number: number;
    seat_number: number;
    category?: {
      category_name: string;
    };
  };
} 