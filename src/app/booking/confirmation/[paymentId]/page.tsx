'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useParams } from 'next/navigation';

interface BookingDetails {
  id: number;
  seat_id: number;
  show_id: number;
  payment_id: string;
  seat: {
    row_number: number;
    seat_number: number;
    category: string;
  };
  show: {
    start_time: string;
    movie: {
      title: string;
    };
  };
}

export default function ConfirmationPage() {
  const params = useParams();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // 1. Hole zuerst die Buchungs-ID über payment
        const paymentResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments/${params.paymentId}`
        );
        if (!paymentResponse.ok) {
          throw new Error('Payment nicht gefunden');
        }
        const paymentData = await paymentResponse.json();
        
        // 2. Hole dann die Buchungsdetails
        const bookingResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/${paymentData.booking_id}`
        );
        if (!bookingResponse.ok) {
          throw new Error('Buchung nicht gefunden');
        }
        const bookingData = await bookingResponse.json();
        setBookingDetails(bookingData);
      } catch (err) {
        setError('Fehler beim Laden der Buchungsdetails');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.paymentId) {
      fetchBookingDetails();
    }
  }, [params.paymentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Laden...</div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-red-500">{error || 'Keine Buchungsdetails gefunden'}</div>
      </div>
    );
  }

  const qrCodeData = JSON.stringify({
    bookingId: bookingDetails.id,
    movie: bookingDetails.show.movie.title,
    showTime: new Date(bookingDetails.show.start_time).toLocaleString('de-DE'),
    seat: `Reihe ${bookingDetails.seat.row_number}, Platz ${bookingDetails.seat.seat_number}`,
    category: bookingDetails.seat.category,
    paymentId: bookingDetails.payment_id
  });

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Buchungsbestätigung</h1>
        
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold">{bookingDetails.show.movie.title}</h2>
          <p className="text-gray-600">
            {new Date(bookingDetails.show.start_time).toLocaleString('de-DE')}
          </p>
        </div>

        <div className="space-y-4">
          <p>
            <span className="font-semibold">Sitzplatz:</span> Reihe {bookingDetails.seat.row_number}, 
            Platz {bookingDetails.seat.seat_number}
          </p>
          <p>
            <span className="font-semibold">Kategorie:</span> {bookingDetails.seat.category}
          </p>
          <p>
            <span className="font-semibold">Buchungs-ID:</span> {bookingDetails.id}
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <QRCode 
              value={qrCodeData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Scannen Sie den QR-Code, um Ihre Buchungsdetails zu speichern
        </p>
      </div>
    </div>
  );
} 