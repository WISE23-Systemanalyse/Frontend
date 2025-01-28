// Frontend/src/app/booking/components/PriceOverview.tsx
import { useState } from 'react';

interface PriceOverviewProps {
  numberOfSeats: number;
  basePrice?: number;
}

const PriceOverview = ({ numberOfSeats, basePrice = 10.00 }: PriceOverviewProps) => {   
  const subtotal = basePrice * numberOfSeats;
  const mwst = subtotal * 0.19; // 19% MwSt
  const total = subtotal + mwst;

  if (!total) return <div>Laden des gesamten Preises...</div>;

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