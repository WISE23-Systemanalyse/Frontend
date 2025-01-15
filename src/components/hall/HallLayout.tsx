'use client';
import { useEffect, useState } from 'react';

type SeatData = {
  id: number;
  hall_id: number;
  row_number: number;
  seat_number: number;
  seat_type: 'Standard' | 'VIP';
};

interface HallLayoutProps {
  hallId: number;
  onSeatSelect: (selectedSeats: SeatData[]) => void;
}

export default function HallLayout({ hallId, onSeatSelect }: HallLayoutProps) {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/seats/halls/${hallId}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Sitze');
        const data: SeatData[] = await response.json();
        setSeats(data);

        const maxRow = Math.max(...data.map(seat => seat.row_number));
        const maxCol = Math.max(...data.map(seat => seat.seat_number));
        setRows(maxRow);
        setCols(maxCol);
      } catch (error) {
        console.error('Error fetching seats:', error);
        setError('Fehler beim Laden der Sitze. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [hallId]);

  const isAdjacent = (seat: SeatData) => {
    if (selectedSeats.length === 0) return true;
    
    return selectedSeats.some(selected => 
      selected.row_number === seat.row_number && 
      Math.abs(selected.seat_number - seat.seat_number) === 1
    );
  };

  const handleSeatClick = (seat: SeatData) => {
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

  if (isLoading) {
    return <div className="text-white">Lädt Sitzplan...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (seats.length === 0) {
    return <div className="text-white">Keine Sitze verfügbar.</div>;
  }

  return (
    <div className="rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Kino {hallId}</h1>
      <div className="w-full h-8 bg-gray-300 rounded-t-lg mb-8 text-center">Leinwand</div>
      <div
        className="grid gap-1 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 3}rem`,
          transform: 'perspective(1000px) rotateX(10deg)'
        }}
      >
        {Array.from({ length: rows * cols }, (_, idx) => {
          const row = Math.floor(idx / cols) + 1;
          const col = (idx % cols) + 1;
          const seat = seats.find(s => s.row_number === row && s.seat_number === col);
          const uniqueKey = `${row}-${col}`; // Create unique key from row and column

          if (!seat) return <div key={uniqueKey} className="aspect-square"></div>;

          const isSelected = isSeatSelected(seat.id);
          const canSelect = isAdjacent(seat) || selectedSeats.length === 0;

          return (
            <div
              key={uniqueKey}
              className={`
                aspect-square w-8 h-8 
                flex items-center justify-center
                rounded-t-lg cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'bg-green-500 hover:bg-green-600 scale-110' 
                  : seat.seat_type === 'Standard'
                    ? `bg-blue-500 ${canSelect ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`
                    : `bg-yellow-500 ${canSelect ? 'hover:bg-yellow-600' : 'opacity-50 cursor-not-allowed'}`
                }
              `}
              onClick={() => handleSeatClick(seat)}
              title={`Reihe ${seat.row_number}, Platz ${seat.seat_number}`}
            >
              <div className="w-full h-full rounded-t-lg" />
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-t-lg" />
          <span className="text-white">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-t-lg" />
          <span className="text-white">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-t-lg" />
          <span className="text-white">Ausgewählt</span>
        </div>
      </div>
    </div>
  );
}

