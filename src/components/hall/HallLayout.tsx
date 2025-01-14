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
}

export default function HallLayout({ hallId }: HallLayoutProps) {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/seats/halls/27`);
        if (!response.ok) throw new Error('Fehler beim Laden der Sitze');
        const data: SeatData[] = await response.json();
        setSeats(data);

        const maxRow = Math.max(...data.map(seat => seat.row_number));
        const maxCol = Math.max(...data.map(seat => seat.seat_number));
        setRows(maxRow);
        setCols(maxCol);
      } catch (error) {
        console.error('Error fetching seats:', error);
      }
    };

    fetchSeats();
  }, [hallId]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Kino {hallId}</h1>
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

          if (!seat) return <div key={idx} className="aspect-square"></div>;

          return (
            <div
              key={seat.id}
              className={`
                aspect-square w-8 h-8 
                flex items-center justify-center
                rounded-t-lg cursor-pointer transition-transform
                ${seat.seat_type === 'Standard' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-yellow-500 hover:bg-yellow-600'
                }
              `}
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
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-t-lg" />
          <span>VIP</span>
        </div>
      </div>
    </div>
  );
} 