export type Show = {
  show_id: number
  movie_id: number
  hall_id: number
  hall_name: string
  start_time: string
}

export interface TimeSlot {
  time: string
  hall_name: string
  format?: string
}