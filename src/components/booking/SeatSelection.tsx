'use client';

import { useEffect, useState } from 'react';

interface Seat {
  id: number;
<<<<<<< Updated upstream
  number: string;
  category: string;
  price: number;
  seat_row: number;
  seat_number: number;
=======
  row_number: number;
  seat_number: number;
  hall_id: number;
  category: string;
  price: number;
>>>>>>> Stashed changes
}

interface SeatSelectionProps {
  seatId: number;
}

const SeatSelection = ({ seatId }: SeatSelectionProps) => {
  const [seat, setSeat] = useState<Seat | null>(null);
<<<<<<< Updated upstream
  const [seatRow, setSeatRow] = useState<number | null>(null);
  const [seatNumber, setSeatNumber] = useState<number | null>(null);
  const [seatCategory, setSeatCategory] = useState<string | null>(null);
    console.log(seatId);
  useEffect(() => {
    const fetchSeat = async () => {
      try {
        const response = await fetch(`http://localhost:8000/seats/${seatId}`);
        const data = await response.json();
        setSeat(data);
        setSeatRow(data.row_number);
        setSeatNumber(data.seat_number);
        setSeatCategory(data.seat_type);
      } catch (error) {
        console.error('Fehler beim Laden der Sitzdetails:', error);
=======
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
>>>>>>> Stashed changes
      }
    };

    fetchSeat();
<<<<<<< Updated upstream
  }, [seatId]);

  if (!seat) return <div>Laden der Sitzplatzdetails...</div>;
=======

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
>>>>>>> Stashed changes

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div>
<<<<<<< Updated upstream
      <p className="font-semibold">Platz: {seatRow && seatNumber ? `${seatRow}-${seatNumber}` : ''}</p>
        <p>Kategorie: {seatCategory}</p>
=======
        <p className="font-semibold">
          Platz: {seat.row_number}-{seat.seat_number}
        </p>
        <p>Kategorie: {seat.category || 'Standard'}</p>
        <p>Preis: {seat.price?.toFixed(2) || '10.00'} €</p>
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default SeatSelection;