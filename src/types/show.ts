export type Show = {
  id: number
  movie_id: number
  hall_id: number
  start_time: string
}

export interface TimeSlot {
  time: string
  hall_name: string
  format?: string
}