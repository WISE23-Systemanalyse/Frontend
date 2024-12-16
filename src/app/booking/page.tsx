'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFetchBookingData } from './fetchdata';
import BookingHeader from '@/components/booking/BookingHeader';
import ShowDetails from '@/components/booking/ShowDetails';
import SeatSelection from '@/components/booking/SeatSelection';
import PriceOverview from '@/components/booking/PriceOverview';
import BookingActions from '@/components/booking/BookingActions';

const BookingContent = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { booking, isLoading, error } = useFetchBookingData(bookingId || '');
  
  const [loadingStates, setLoadingStates] = useState({
    header: true,
    details: true,
    seats: true,
    price: true,
    actions: true
  });

  const allLoaded = !Object.values(loadingStates).some(state => state);

  useEffect(() => {
    // Simuliere verschiedene Ladezeiten für Komponenten
    setTimeout(() => setLoadingStates(prev => ({ ...prev, header: false })), 500);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, details: false })), 800);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, seats: false })), 1200);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, price: false })), 1500);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, actions: false })), 1800);
  }, []);

  if (isLoading || !allLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div>
        <div className="mt-4 text-gray-600">
          {Object.entries(loadingStates)
            .filter(([_, loading]) => loading)
            .map(([component]) => component)
            .join(', ') || 'Fast fertig...'}
        </div>
      </div>
    );
  }

  const test = {
    id: 1,
    user_id: "user_2qH9EYmeqF0GShzpUxLZzl2tUsq",
    show_id: 1,
    seat_id: 1,
    booking_time: "2024-12-18T00:00:00.000Z",
    payment_id: 1
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <BookingHeader bookingId={1} />
      <ShowDetails showId={1} />
      <SeatSelection seatId={1} />
      
      {error && <div className="text-red-500 p-4">Fehler: {error}</div>}
      
      {test ? (
        <>
          <PriceOverview booking={test} subtotal={0} mwst={0} total={0} />
          <BookingActions booking={test} />
        </>
      ) : (
        <div className="text-gray-500 p-4">Keine Buchungsdaten verfügbar</div>
      )}
    </div>
  );
};

const Booking = () => {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Laden...</div>}>
      <BookingContent />
    </Suspense>
  );
};

export default Booking;