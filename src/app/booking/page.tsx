'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFetchBookingData } from './fetchdata';
import Script from 'next/script';
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

  const [showPayment, setShowPayment] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const merchantId = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID;

  const onScriptLoad = () => {
    if (!window.paypal) return;
    
    window.paypal.Buttons({
      // ... existing PayPal button configuration ...
      onApprove: async (data: any, actions: any) => {
        const details = await actions.order.capture();
        // Hier können Sie die Buchung aktualisieren
        setShowPayment(false);
        // Erfolgsbenachrichtigung anzeigen
      }
    }).render('#paypal-button-container');
  };

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
      {showPayment ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Script 
            src={`https://www.sandbox.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&merchant-id=${merchantId}`}
            onLoad={onScriptLoad}
          />
          <h2 className="text-2xl font-bold mb-4">Zahlung</h2>
          <div id="paypal-button-container" className="min-h-[150px]" />
          <button 
            onClick={() => setShowPayment(false)}
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            Zurück zur Buchung
          </button>
        </div>
      ) : (
        <>
          <BookingHeader bookingId={1} />
          <ShowDetails showId={1} />
          <SeatSelection seatId={1} />
          
          {error && <div className="text-red-500 p-4">Fehler: {error}</div>}
          
          {test ? (
            <>
              <PriceOverview booking={test} subtotal={0} mwst={0} total={0} />
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPayment(true)}
                  className="bg-[#8B0000] text-white px-6 py-2 rounded hover:bg-[#a00000]"
                >
                  Zur Zahlung
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 p-4">Keine Buchungsdaten verfügbar</div>
          )}
        </>
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