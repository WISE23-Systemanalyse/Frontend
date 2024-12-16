import { Seat } from '@/types/shows'

export const mockSeats: Seat[] = Array.from({ length: 80 }, (_, i) => ({
  id: `seat-${i}`,
  row: String.fromCharCode(65 + Math.floor(i / 10)),
  number: (i % 10) + 1,
  status: Math.random() > 0.8 ? 'occupied' as const : 'available' as const
}))