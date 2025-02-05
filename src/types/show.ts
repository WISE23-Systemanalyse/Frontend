export interface Show {
  show_id: number;
  movie_id: number;
  hall_id: number;
  start_time: string | Date;
  base_price: number;
  hall_name?: string;  // Wird im Frontend benötigt
}

export interface ShowWithDetails extends Show {
  title: string | null;
  description: string | null;
  name: string | null;
}

export interface TimeSlot {
  time: string
  hall_name: string
  format?: string
}