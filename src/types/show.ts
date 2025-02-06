export type Show = {
  show_id: number
  movie_id: number
  hall_id: number
  hall_name: string
  start_time: string
  base_price: number
}

export interface TimeSlot {
  time: string
  hall_name: string
  format?: string
}