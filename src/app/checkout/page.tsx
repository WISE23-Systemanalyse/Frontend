"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Script from 'next/script';
import PriceOverview from '@/components/booking/PriceOverview';
import SeatSelection from '@/components/booking/SeatSelection';

interface PaymentData {
  amount: number;
  tax: number;
  payment_method: string;
  payment_status: string;
  payment_details: any;
}

interface BookingData {
  seat_id: number;
  show_id: number;
  user_id: number;
  payment_id: string;
}

interface BookingRequest {
  bookings: {
    seat_id: number;
    show_id: number;
    user_id: number;
    payment_id: string;
  }[];
}

interface SeatWithCategory {
  id: number;
  row_number: number;
  seat_number: number;
  hall_id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    price: number;
  };
}

export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const seats = searchParams.get('seats')?.split(',').map(Number) || [];
  const showId = Number(searchParams.get('showId'));
  const [timeLeft, setTimeLeft] = useState(600);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const merchantId = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID;
  const [isLoading, setIsLoading] = useState(false);
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [seatDetails, setSeatDetails] = useState<SeatWithCategory[]>([]);

  const TAX_RATE = 0.19; // 19% MwSt

  useEffect(() => {
    if (!seats.length || !showId) {
      router.push('/');
      return;
    }
  }, [seats, showId, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          router.push(`/movie/${params.id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [params.id, router]);

  useEffect(() => {
    const fetchSeatDetails = async () => {
      const seatPromises = seats.map(seatId =>
        fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${seatId}`)
          .then(res => res.json())
      );
      
      const details = await Promise.all(seatPromises);
      setSeatDetails(details);
    };

    fetchSeatDetails();
  }, [seats]);

  const createBookings = async (paymentId: string) => {
    console.log('Creating bookings for seats:', seats);
    
    const bookings = seats.map(seatId => ({
      seat_id: seatId,
      show_id: showId,
      user_id: 1,
      payment_id: paymentId
    }));

    console.log('Request body:', JSON.stringify(bookings, null, 2));

    try {
      const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookings)
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : { message: 'Unknown error' };
        console.error('Booking error details:', errorData);
        throw new Error(`Booking failed: ${errorData.message}`);
      }

      const createdBookings = responseText ? JSON.parse(responseText) : null;
      console.log('Bookings created:', createdBookings);
      return createdBookings;
    } catch (error) {
      console.error('Full error:', error);
      throw error;
    }
  };

  const initializePayPal = () => {
    if (paypalInitialized || !showId || !seats.length) return;
    setPaypalInitialized(true);

    // @ts-ignore
    window.paypal?.Buttons({
      createOrder: (data: any, actions: any) => {
        const basePrice = 10 * seats.length;
        const taxAmount = basePrice * TAX_RATE;
        const totalAmount = basePrice + taxAmount;

        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: "EUR",
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "EUR",
                  value: basePrice.toFixed(2)
                },
                tax_total: {
                  currency_code: "EUR",
                  value: taxAmount.toFixed(2)
                }
              }
            },
            items: [{
              name: "Kinokarten",
              quantity: seats.length.toString(),
              unit_amount: {
                currency_code: "EUR",
                value: "10.00"
              }
            }]
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          setIsLoading(true);
          const paypalDetails = await actions.order.capture();
          console.log('PayPal payment captured:', paypalDetails);

          // 1. Create payment
          const paymentResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: 10 * seats.length,
              tax: (10 * seats.length) * 0.19,
              payment_method: 'PAYPAL',
              payment_status: 'COMPLETED',
              payment_details: paypalDetails
            } as PaymentData)
          });

          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            console.error('Payment error:', errorData);
            throw new Error('Payment creation failed');
          }

          const payment = await paymentResponse.json();
          console.log('Payment created:', payment);

          // 2. Create bookings for all seats
          const bookings = await createBookings(payment.id);
          console.log('Bookings created:', bookings);

          router.push(`/booking/confirmation/${payment.id}`);
        } catch (error) {
          console.error('Error:', error);
          alert('Ein Fehler ist aufgetreten. Bitte kontaktieren Sie den Support.');
        } finally {
          setIsLoading(false);
        }
      }
    }).render('#paypal-button-container');
  };

  const calculateTotal = () => {
    return seatDetails.reduce((total, seat) => total + seat.category.price, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      {showId && seats.length > 0 && (
        <Script 
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&merchant-id=${merchantId}`}
          onLoad={initializePayPal}
          strategy="afterInteractive"
        />
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Ausgewählte Sitzplätze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seats.map(seatId => (
              <SeatSelection key={seatId} seatId={seatId} />
            ))}
          </div>
          <p className="text-white mt-4">
            Zeit zum Bezahlen: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <PriceOverview numberOfSeats={seats.length} />
        
        <div id="paypal-button-container" className="min-h-[150px] bg-white rounded-lg p-4" />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white">Buchung wird verarbeitet...</div>
        </div>
      )}
    </div>
  );
}
