export interface Seat {
  id: string
  row: string
  number: number
  status: 'available' | 'reserved' | 'occupied'
}

export interface SeatType {
  id: string
  name: string
  price: number
}

export interface Show {
  id: string
  movieId: string
  startTime: string
  seats: Seat[]
}