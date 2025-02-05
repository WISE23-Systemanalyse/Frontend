export interface Show {
  show_id: number;
  id: number;  // Alias für show_id
  movie_id: number;
  hall_id: number;
  start_time: string;  // Nur string, kein Date
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

interface ShowData {
  show_id: number;
  movie_id: number;
  hall_id: number;
  start_time: string;
  base_price: number;
  hall_name?: string;
}

// Konstruktor-Funktion für Show-Objekte
export function createShow(data: ShowData): Show {
  return {
    ...data,
    id: data.show_id
  };
}