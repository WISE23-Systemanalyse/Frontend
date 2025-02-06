export interface BookingDetailsWithPayment {
    id: number;
  seat_id: number;
  show_id: number;
  payment_id: string;
  token: string;
  seat: {
    row_number: number;
    seat_number: number;
    category: {
      category_name: string;
      surcharge: number;
    };
  };
  show: {
    start_time: string;
    movie: {
      title: string;
    };
  };
  payment: {
    amount: number;
    payment_method: string;
    payment_status: string;
  };
}