export interface Seat {
    id: number
    hall_id: number
    row_number: number
    seat_number: number
    seat_type:  'STANDARD' | 'PREMIUM' | 'VIP' | 'NONE'
}


