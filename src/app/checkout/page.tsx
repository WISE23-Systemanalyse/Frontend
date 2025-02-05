"use client";
import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import PriceOverview from '@/components/booking/PriceOverview';
import SeatSelection from '@/components/booking/SeatSelection';
import { useSession } from 'next-auth/react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
  
  const seats = useMemo(() => 
    searchParams.get('seats')?.split(',').map(Number) || [],
    [searchParams]
  );
  const showId = Number(searchParams.get('showId'));
  const [timeLeft, setTimeLeft] = useState(600);
  const [isLoading, setIsLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!seats.length || !showId) {
      router.push('/');
      return;
    }

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
  }, [seats, showId, params.id, router]);

  // Create PayPal Order
  const createOrder = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats,
          showId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [seats, showId]);

  // Handle PayPal Approval
  const handlePayPalApprove = useCallback(async (data: { orderID: string }) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${process.env.BACKEND_URL}/payments/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          seats,
          showId,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const result = await response.json();
      router.push(`/booking/confirmation/${result.payment_id}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  }, [seats, showId, user?.id, router]);

  const paypalOptions = {
    "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "EUR",
    intent: "capture",
    "merchant-id": process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Selected Seats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seats.map(seatId => (
              <SeatSelection key={seatId} seatId={seatId} showId={showId} />
            ))}
          </div>
          <p className="text-white mt-4">
            Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <PriceOverview numberOfSeats={seats.length} seatIds={seats} showId={showId} />
        
        <div className="bg-white rounded-lg p-4">
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={handlePayPalApprove}
              style={{ layout: "vertical" }}
            />
          </PayPalScriptProvider>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white">Processing booking...</div>
        </div>
      )}
    </div>
  );
}