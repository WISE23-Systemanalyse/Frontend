"use client";
import { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import PriceOverview from '@/components/booking/PriceOverview';
import SeatSelection from '@/components/booking/SeatSelection';
import { useSession } from 'next-auth/react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Category } from '@/types/categories';
interface SeatWithCategory {
  id: number;
  row_number: number;
  seat_number: number;
  hall_id: number;
  category_id: number;
  category: Category;
}

interface ShowDetails {
  id: number;
  base_price: number;
  datetime: string;
  movie_id: number;
  hall_id: number;

}


export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { data: session } = useSession();
  const user = session?.user;
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  
  // Seats in useMemo einwickeln
  const seats = useMemo(() => 
    searchParams.get('seats')?.split(',').map(Number) || [],
    [searchParams]
  );
  
  const showId = Number(searchParams.get('showId'));
  const [timeLeft, setTimeLeft] = useState(600);
  const [isLoading, setIsLoading] = useState(false);
  const [seatDetails, setSeatDetails] = useState<SeatWithCategory[]>([]);
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null);

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
      try {
        const seatPromises = seats.map(async (seatId) => {
          // Sitz laden
          const seatResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${seatId}`);
          if (!seatResponse.ok) throw new Error(`Fehler beim Laden von Sitz ${seatId}`);
          const seatData = await seatResponse.json();

          // Kategorie laden
          const categoryResponse = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`);
          if (!categoryResponse.ok) throw new Error('Kategorie konnte nicht geladen werden');
          const categoryData = await categoryResponse.json();

          return {
            ...seatData,
            category: categoryData
          };
        });

        const details = await Promise.all(seatPromises);
        setSeatDetails(details);
      } catch (error) {
        console.error('Fehler beim Laden der Sitzdetails:', error);
      }
    };

    if (seats.length > 0) {
      fetchSeatDetails();
    }
  }, [seats]);

  useEffect(() => {
    const fetchShowDetails = async () => {
      const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${showId}`);
      const data = await response.json();
      setShowDetails(data);
    };

    fetchShowDetails();
  }, [showId]);

  const createBookings = useCallback(async (paymentId: string) => {
    console.log('Creating bookings for seats:', seats);
    
    const bookingRequest = seats.map(seatId => {
      const seatDetail = seatDetails.find(detail => detail.id === seatId);
      if (!seatDetail) throw new Error(`Sitzdetails für Sitz ${seatId} nicht gefunden`);
      
      if (!showDetails) throw new Error('Showdetails nicht gefunden');
      
      return {
        seat_id: seatId,
        show_id: showId,
        user_id: user?.id,
        payment_id: paymentId,
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      };
    });

    console.log('Request body:', JSON.stringify(bookingRequest, null, 2));

    try {
      const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRequest)
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
  }, [seats, seatDetails, showDetails, showId, user?.id]);

  const calculateTotal = useCallback(() => {
    if (!showDetails || !seatDetails.length) return 0;
    return seatDetails.reduce((total, seat) => {
      const seatPrice = showDetails.base_price + (seat.category?.surcharge || 0);
      return total + seatPrice;
    }, 0);
  }, [showDetails, seatDetails]);

  const paypalOptions = {
    "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "EUR",
    intent: "capture",
    "merchant-id": process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID
  };

  const createPayPalOrder = useCallback(async () => {
    if (!showDetails || !seatDetails.length) return;

    const items = seatDetails.map(seat => ({
      name: `Sitz R${seat.row_number} P${seat.seat_number} (${seat.category.category_name || 'Standard'})`,
      quantity: "1",
      unit_amount: {
        currency_code: "EUR",
        value: (showDetails.base_price + seat.category.surcharge).toFixed(2)
      }
    }));

    const totalAmount = items.reduce((sum, item) => 
      sum + Number(item.unit_amount.value), 0
    );
    const taxAmount = totalAmount * TAX_RATE;
    const finalAmount = totalAmount + taxAmount;

    return {
      purchase_units: [{
        amount: {
          currency_code: "EUR",
          value: finalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "EUR",
              value: totalAmount.toFixed(2)
            },
            tax_total: {
              currency_code: "EUR",
              value: taxAmount.toFixed(2)
            }
          }
        },
        items: items
      }]
    };
  }, [showDetails, seatDetails]);

  interface PayPalDetails {
    payer: unknown;
    status: string;
  }

  interface Payment {
    amount: number;
    tax: number;
    payment_method: string;
    payment_status: string;
    payment_details: string;
  }

  interface PaymentResponse {
    id: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePayPalApprove = useCallback(async (data: any, actions: any) => {
    try {
      setIsLoading(true);
      const paypalDetails: PayPalDetails = await actions.order.capture();
      
      // 1. Create payment
      const totalAmount: number = calculateTotal();
      const payment: Payment = {
        amount: totalAmount,
        tax: totalAmount * TAX_RATE,
        payment_method: 'PAYPAL',
        payment_status: 'COMPLETED',
        payment_details: JSON.stringify({
          paypal_order_id: data.orderID,
          payer: paypalDetails.payer,
          status: paypalDetails.status
        })
      };

      const paymentResponse = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment)
        }
      );

      if (!paymentResponse.ok) {
        throw new Error(await paymentResponse.text());
      }

      const createdPayment: PaymentResponse = await paymentResponse.json();
      await createBookings(createdPayment.id);
      router.push(`/booking/confirmation/${createdPayment.id}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ein Fehler ist aufgetreten. Bitte kontaktieren Sie den Support.');
    } finally {
      setIsLoading(false);
    }
  }, [calculateTotal, createBookings, router]);

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Ausgewählte Sitzplätze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seats.map(seatId => (
              <SeatSelection key={seatId} seatId={seatId} showId={showId} />
            ))}
          </div>
          <p className="text-white mt-4">
            Zeit zum Bezahlen: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <PriceOverview numberOfSeats={seats.length} seatIds={seats} showId={showId} />
        
        <div className="bg-white rounded-lg p-4">
          <PayPalScriptProvider options={paypalOptions}> 
            <PayPalButtons
              createOrder={async (_, actions) => {
                const order = await createPayPalOrder();
                if (!order) throw new Error('Could not create order');
                return actions.order.create({
                  intent: "CAPTURE",
                  ...order
                });
              }}
              onApprove={handlePayPalApprove}
              style={{ layout: "vertical" }}
            />
          </PayPalScriptProvider>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white">Buchung wird verarbeitet...</div>
        </div>
      )}
    </div>
  );
}
