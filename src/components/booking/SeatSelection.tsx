'use client';

import { useEffect, useState } from 'react';

interface Seat {
  id: number;
  number: string;
  category: string;
  price: number;
  seat_row: number;
  seat_number: number;
}

interface SeatSelectionProps {
  seatId: number;
}

const SeatSelection = ({ seatId }: SeatSelectionProps) => {
  const [seat, setSeat] = useState<Seat | null>(null);
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
      }
    };

    fetchSeat();
  }, [seatId]);

  if (!seat) return <div>Laden der Sitzplatzdetails...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div>
      <p className="font-semibold">Platz: {seatRow && seatNumber ? `${seatRow}-${seatNumber}` : ''}</p>
        <p>Kategorie: {seatCategory}</p>
      </div>
    </div>
  );
};

export default SeatSelection;