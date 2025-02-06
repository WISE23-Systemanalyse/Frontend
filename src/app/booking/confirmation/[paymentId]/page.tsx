'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useParams } from 'next/navigation';

interface Payment {
  id: number;
  amount: number;
  payment_time: string;
  tax: number;
  payment_method: string;
  payment_status: string;
  payment_details: string;
}

interface BookingDetails {
  id: number;
  seat_id: number;
  show_id: number;
  payment_id: string;
  token: string;
  seat: {
    row_number: number;
    seat_number: number;
    category: {
      category_name: string;
      surcharge: number;
    };
  };
  show: {
    start_time: string;
    movie: {
      title: string;
    };
  };
}

interface ConfirmationData {
  payment: Payment;
  bookings: BookingDetails[];
}

export default function ConfirmationPage() {
  const params = useParams();
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchConfirmationData = async () => {
      try {
        // 1. Payment-Details
        const paymentResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments/${params.paymentId}`
        );
        if (!paymentResponse.ok) throw new Error('Zahlungsdetails nicht gefunden');
        const paymentData = await paymentResponse.json();
        console.log('Payment Data:', paymentData);

        // 2. Buchungen
        const bookingsResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/payment/${params.paymentId}`
        );
        if (!bookingsResponse.ok) throw new Error('Buchungen nicht gefunden');
        const bookingsData = await bookingsResponse.json();
        console.log('Bookings Data:', bookingsData);

        // 3. Für jede Buchung: Details laden
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: BookingDetails) => {
            // Seat Details
            const seatResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${booking.seat_id}`
            );
            const seatData = await seatResponse.json();

            // Kategorie Details
            const categoryResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`
            );
            const categoryData = await categoryResponse.json();

            // Show Details
            const showResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${booking.show_id}`
            );
            const showData = await showResponse.json();

            // Movie Details
            const movieResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/movies/${showData.movie_id}`
            );
            const movieData = await movieResponse.json();

            return {
              ...booking,
              seat: {
                ...seatData,
                category: categoryData
              },
              show: {
                ...showData,
                movie: movieData
              }
            };
          })
        );

        console.log('Enriched Bookings:', enrichedBookings);

        setConfirmationData({
          payment: paymentData,
          bookings: enrichedBookings
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Fehler beim Laden der Details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.paymentId) {
      fetchConfirmationData();
    }
  }, [params.paymentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Laden...</div>
      </div>
    );
  }

  if (error || !confirmationData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-red-500">{error || 'Keine Details gefunden'}</div>
      </div>
    );
  }

  const { payment, bookings } = confirmationData;
  const firstBooking = bookings[0];

  
  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Buchungsbestätigung</h1>
        
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold">
            {firstBooking.show?.movie?.title || 'Unbekannter Film'}
          </h2>
          <p className="text-gray-600">
            {firstBooking.show?.start_time ? 
              new Date(firstBooking.show.start_time).toLocaleString('de-DE') : 
              'Zeitpunkt unbekannt'
            }
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Zahlungsdetails:</h3>
          <p>Gesamtbetrag: {payment.amount.toFixed(2)} €</p>
          <p>MwSt.: {payment.tax.toFixed(2)} €</p>
          <p>Zahlungsmethode: {payment.payment_method}</p>
          <p>Status: {payment.payment_status}</p>
          <p>Datum: {new Date(payment.payment_time).toLocaleString('de-DE')}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Gebuchte Plätze:</h3>
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="p-4 bg-gray-50 rounded flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                setSelectedBooking(booking);
                setShowModal(true);
              }}
            >
              <div>
                <p className="font-medium">
                  Reihe {booking.seat?.row_number}, Platz {booking.seat?.seat_number}
                  <span className="ml-2 text-gray-600">
                    ({booking.seat?.category?.category_name || 'Standard'})
                  </span>
                </p>
              </div>
              <div className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Modal für QR Code */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Ticket QR-Code</h3>
                <p className="text-sm text-gray-600">
                  Reihe {selectedBooking.seat?.row_number}, Platz {selectedBooking.seat?.seat_number}
                </p>
              </div>
              
              <div className="flex justify-center mb-4">
                <QRCode 
                  value={JSON.stringify({
                    bookingId: selectedBooking.id,
                    token: selectedBooking.token
                  })}
                  size={200}
                  level="H"
                />
              </div>

              <button 
                className="w-full py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}