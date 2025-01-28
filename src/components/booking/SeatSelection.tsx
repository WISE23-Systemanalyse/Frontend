'use client';

import { useEffect, useState } from 'react';

interface Seat {
  id: number;
  row_number: number;
  seat_number: number;
  hall_id: number;
  category: string;
  price: number;
}

interface SeatSelectionProps {
  seatId: number;
}

const SeatSelection = ({ seatId }: SeatSelectionProps) => {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSeat = async () => {
      if (!seatId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${seatId}`);
        
        if (!response.ok) {
          throw new Error('Sitz konnte nicht geladen werden');
        }

        const data = await response.json();
        console.log('Loaded seat data:', data);
        
        if (isMounted) {
          setSeat(data);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError('Fehler beim Laden der Sitzdetails');
          console.error('Fehler beim Laden der Sitzdetails:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSeat();

    return () => {
      isMounted = false;
    };
  }, [seatId]);

  if (isLoading) {
    return <div className="bg-white p-4 rounded-lg shadow">Laden...</div>;
  }

  if (error || !seat) {
    return (
      <div className="bg-white p-4 rounded-lg shadow text-red-500">
        {error || 'Sitzplatz nicht gefunden'}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div>
        <p className="font-semibold">
          Platz: {seat.row_number}-{seat.seat_number}
        </p>
        <p>Kategorie: {seat.category || 'Standard'}</p>
        <p>Preis: {seat.price?.toFixed(2) || '10.00'} €</p>
      </div>
    </div>
  );
};

export default SeatSelection;