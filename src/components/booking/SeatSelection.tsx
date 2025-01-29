'use client';

import { useEffect, useState } from 'react';

interface Seat {
  id: number;
  row_number: number;
  seat_number: number;
  hall_id: number;
  category_id: number;
  category: {
    category_name: string;
    surcharge: number;
  };
}

interface Show {
  base_price: number;
}

interface SeatSelectionProps {
  seatId: number;
  showId: number;
}

const SeatSelection = ({ seatId, showId }: SeatSelectionProps) => {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!seatId || !showId) return;
      
      try {
        setIsLoading(true);
        
        // Show Details laden
        const showResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${showId}`);
        if (!showResponse.ok) {
          throw new Error('Show konnte nicht geladen werden');
        }
        const showData = await showResponse.json();
        
        // Sitz laden
        const seatResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${seatId}`);
        if (!seatResponse.ok) {
          throw new Error('Sitz konnte nicht geladen werden');
        }
        const seatData = await seatResponse.json();

        // Kategorie laden
        const categoryResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`);
        if (!categoryResponse.ok) {
          throw new Error('Kategorie konnte nicht geladen werden');
        }
        const categoryData = await categoryResponse.json();
        
        if (isMounted) {
          setShow(showData);
          setSeat({
            ...seatData,
            category: categoryData
          });
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError('Fehler beim Laden der Details');
          console.error('Fehler beim Laden der Details:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [seatId, showId]);

  if (isLoading) {
    return <div className="animate-pulse bg-neutral-800 p-4 rounded-lg">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
    </div>;
  }

  if (error || !seat || !show) {
    return (
      <div className="bg-neutral-800 p-4 rounded-lg">
        <p className="text-red-500">
          {error || 'Details konnten nicht geladen werden'}
        </p>
      </div>
    );
  }

  const calculatePrice = () => {
    return show.base_price + (seat.category?.surcharge ?? 0);
  };

  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Sitzplatz</span>
          <span className="font-medium">Reihe {seat.row_number} Platz {seat.seat_number}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Kategorie</span>
          <span className="font-medium">{seat.category?.category_name || 'Standard'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Preis</span>
          <span className="font-medium">{calculatePrice().toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;