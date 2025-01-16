'use client'
import { Square, Armchair, Crown, Ban } from 'lucide-react'
import { Seat } from '@/types/index'
import { useEffect, useState } from 'react'
interface HallLayoutProps {
  hallID: number;
  onSeatSelect: (selectedSeats: Seat[]) => void;
}


export function HallLayout({ hallID, onSeatSelect }: HallLayoutProps) {
  // Calculate dimensions based on seats
  const [seats, setSeats] = useState<Seat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  

  const fetchSeats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.BACKEND_URL}/halls/${hallID}/seats`)
      const data = await response.json()
      console.log(data) 
      setSeats(data)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchSeats();
  }, [hallID])
  const rows = seats.length ? Math.max(...seats.map(seat => seat.row_number)) : 0
  const seatsPerRow = seats.length ? Math.max(...seats.map(seat => seat.seat_number)) : 0

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  const isAdjacent = (seat: Seat) => {
    if (selectedSeats.length === 0) return true;
  }
  const handleSeatClick = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      // If the seat is already selected, we're deselecting it
      let newSelection = selectedSeats.filter(s => s.id !== seat.id);
      
      // Check if this was a middle seat in a group of three
      if (selectedSeats.length >= 3) {
        const seatIndex = selectedSeats.findIndex(s => s.id === seat.id);
        if (seatIndex > 0 && seatIndex < selectedSeats.length - 1) {
          // This is a middle seat, so we need to check if it's in a group of three
          const prevSeat = selectedSeats[seatIndex - 1];
          const nextSeat = selectedSeats[seatIndex + 1];
          if (prevSeat.row_number === seat.row_number && nextSeat.row_number === seat.row_number &&
              Math.abs(prevSeat.seat_number - seat.seat_number) === 1 &&
              Math.abs(nextSeat.seat_number - seat.seat_number) === 1) {
            // This is indeed a middle seat in a group of three, so remove all three
            newSelection = selectedSeats.filter(s => s.id !== prevSeat.id && s.id !== seat.id && s.id !== nextSeat.id);
          }
        }
      }
      
      setSelectedSeats(newSelection);
      onSeatSelect(newSelection);
      
    } else if (isAdjacent(seat) || selectedSeats.length === 0) {
      // Adding a new seat (existing logic)
      const newSelection = [...selectedSeats, seat].sort((a, b) => 
        a.row_number === b.row_number 
          ? a.seat_number - b.seat_number 
          : a.row_number - b.row_number
      );
      setSelectedSeats(newSelection);
      onSeatSelect(newSelection);
    }else {
      console.log('Seat not adjacent to selected seats');
    }
  };

  const isSeatSelected = (seatId: number) => {
    return selectedSeats.some(s => s.id === seatId);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="relative mb-6">
          <div className="w-full h-8 bg-red-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              LEINWAND
            </span>
          </div>
        </div>

        <div className="flex justify-between mb-2 px-1">
          {Array.from({ length: seatsPerRow }).map((_, i) => (
            <span key={i} className="text-xs text-neutral-500 w-8 text-center">
              {i + 1}
            </span>
          ))}
        </div>

        <div className="flex">
          <div className="flex flex-col justify-between pr-2 py-1">
            {Array.from({ length: rows }).map((_, i) => (
              <span key={i} className="text-xs text-neutral-500 h-8 flex items-center">
                {i + 1}
              </span>
            ))}
          </div>

          <div 
            className="grid gap-2 flex-1" 
            style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}
          >
            { rows*seatsPerRow > 0 && Array.from({ length: rows * seatsPerRow }).map((_, index) => {
              const row = Math.floor(index / seatsPerRow) + 1
              const seatNum = (index % seatsPerRow) + 1
              const seat = seats.find(s => s.row_number === row && s.seat_number === seatNum)

              if (!seat || seat.seat_type === 'NONE') {
                return <div key={index} className="aspect-square rounded-md opacity-10" />
              }

              return (
                <div
                  key={index}
                  onClick={() => handleSeatClick(seat)}
                  className={`
                    aspect-square rounded-md flex items-center justify-center
                    ${seat.seat_type === "STANDARD" ? 'bg-emerald-600' : ''}
                    ${seat.seat_type === 'PREMIUM' ? 'bg-blue-600' : ''}
                    ${seat.seat_type === "VIP" ? 'bg-purple-600' : ''}
                    ${isSeatSelected(seat.id) ? 'border-red-700' : ''}
                    
                  `}
                  title={`Reihe ${row}, Sitz ${seatNum} (${seat.seat_type})`}
                >
                  {seat.seat_type === 'STANDARD' && <Square size={12} className="text-white" />}
                  {seat.seat_type === 'PREMIUM' && <Armchair size={14} className="text-white" />}
                  {seat.seat_type === 'VIP' && <Crown size={14} className="text-white" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-6 justify-center mt-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Square size={12} className="text-white" />
            </div>
            <span className="text-gray-400">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Armchair size={14} className="text-white" />
            </div>
            <span className="text-gray-400">Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <Crown size={14} className="text-white" />
            </div>
            <span className="text-gray-400">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
              <Ban size={14} className="text-white line-through" />
            </div>
            <span className="text-gray-400">Nicht Verfügbar</span>
          </div>
        </div>
        
      </div>
    </div>
  )
}