// Frontend/src/app/booking/components/PriceOverview.tsx
import { useState, useEffect } from 'react';

interface PriceOverviewProps {
  numberOfSeats: number;
  seatIds: number[];
  showId: number;
}

interface Seat {
  id: number;
  category_id: number;
  category: {
    category_name: string;
    surcharge: number;
  };
}

interface Show {
  base_price: number;
}

const PriceOverview = ({ numberOfSeats, seatIds, showId }: PriceOverviewProps) => {   
  const [seats, setSeats] = useState<Seat[]>([]);
  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        // Show Details laden
        const showResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${showId}`);
        if (!showResponse.ok) throw new Error('Show konnte nicht geladen werden');
        const showData = await showResponse.json();
        setShow(showData);

        // Sitzdetails laden
        const seatPromises = seatIds.map(async (seatId) => {
          const seatResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${seatId}`);
          if (!seatResponse.ok) throw new Error(`Sitz ${seatId} konnte nicht geladen werden`);
          const seatData = await seatResponse.json();

          const categoryResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`);
          if (!categoryResponse.ok) throw new Error('Kategorie konnte nicht geladen werden');
          const categoryData = await categoryResponse.json();

          return {
            ...seatData,
            category: categoryData
          };
        });

        const seatResults = await Promise.all(seatPromises);
        setSeats(seatResults);
      } catch (error) {
        console.error('Fehler beim Laden der Preisdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (showId && seatIds.length > 0) {
      fetchPriceData();
    }
  }, [showId, seatIds]);

  const calculateSubtotal = () => {
    if (!show || !seats.length) return 0;
    return seats.reduce((total, seat) => {
      return total + (show.base_price + (seat.category?.surcharge || 0));
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const mwst = subtotal * 0.19; // 19% MwSt
  const total = subtotal + mwst;

  if (isLoading) {
    return <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Preisübersicht</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Zwischensumme ({numberOfSeats} {numberOfSeats === 1 ? 'Ticket' : 'Tickets'})</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>MwSt. (19%)</span>
          <span>{mwst.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2 mt-2">
          <span>Gesamtbetrag</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default PriceOverview;