export interface CommonBooking {
    id: number;
    show_id: number;
    show: {
      id: number;
      movie: {
        title: string;
      };
      start_time: string;
    };
    seat: {
      row_number: number;
      seat_number: number;
      category: {
        category_name: string;
      };
    };
  }