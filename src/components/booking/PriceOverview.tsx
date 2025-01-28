// Frontend/src/app/booking/components/PriceOverview.tsx
<<<<<<< Updated upstream
import  Booking from '@/app/booking/fetchdata';
import { Suspense, useEffect, useState } from 'react';

interface PriceOverviewProps {
  booking: Booking;
  subtotal: number;
  mwst: number;
  total: number;
}

interface Booking1 {
    id: number;
    user_id: string;
    show_id: number;
    seat_id: number;
    booking_time: string;
    payment_id: number;
}

const PriceOverview = ({ booking }: PriceOverviewProps) => {   
  const [bookingDetails, setBookingDetails] = useState<Booking1 | null>(null);
  const [subtotal, setSubtotal] = useState(0.0);
  const [mwst, setMwst] = useState(0.0);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:8000/bookings/${booking.id}`);
        const data = await response.json();
        console.log('Booking data:', data);
        
        const payment_id = data.payment_id;
        const response1 = await fetch(`http://localhost:8000/payments/${payment_id}`);
        const data1 = await response1.json();
        console.log('Payment data:', data1);
        
        // Stelle sicher, dass die Werte Zahlen sind
        setSubtotal(Number(data1.amount) || 0);
        setMwst(Number(data1.tax) || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSubtotal(0);
        setMwst(0);
      }
    };
    fetchBooking();
  }, [booking.id]);

  const total = subtotal + mwst;

  if (!total) return <div>Laden des gesammten Preises...</div>;

  return (
    <Suspense fallback={<div>Laden...</div>}>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Preisübersicht</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span>{Number(subtotal).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>MwSt. (19%)</span>
            <span>{Number(mwst).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 mt-2">
            <span>Gesamtbetrag</span>
            <span>{Number(total).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </Suspense>
=======
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
>>>>>>> Stashed changes
  );
};

export default PriceOverview;