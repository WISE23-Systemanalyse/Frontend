"use client";
import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Square, Armchair, Crown, ChevronLeft } from 'lucide-react';

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
  const [seatDetails, setSeatDetails] = useState<Array<{
    id: number;
    row_number: number;
    seat_number: number;
    category_id: number;
    category: {
      surcharge: number;
      category_name: string;
    };
  }>>([]);
  const [showDetails, setShowDetails] = useState<{ base_price: number } | null>(null);

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

  // Fetch show details
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/shows/${showId}`);
        const data = await response.json();
        setShowDetails(data);
      } catch (error) {
        console.error('Error fetching show details:', error);
      }
    };

    if (showId) {
      fetchShowDetails();
    }
  }, [showId]);

  // Fetch seat details with categories
  useEffect(() => {
    const fetchSeatDetails = async () => {
      try {
        const details = await Promise.all(
          seats.map(async (seatId) => {
            const seatResponse = await fetch(`${process.env.BACKEND_URL}/seats/${seatId}`);
            const seatData = await seatResponse.json();
            
            // Fetch category details
            const categoryResponse = await fetch(`${process.env.BACKEND_URL}/categories/${seatData.category_id}`);
            const categoryData = await categoryResponse.json();
            
            return {
              ...seatData,
              category: categoryData
            };
          })
        );
        setSeatDetails(details);
      } catch (error) {
        console.error('Error fetching seat details:', error);
      }
    };

    if (seats.length) {
      fetchSeatDetails();
    }
  }, [seats]);

  // Preisberechnung Funktion
  const calculatePrice = (categoryId: number) => {
    if (!showDetails) return 0;
    const seat = seatDetails.find(s => s.category_id === categoryId);
    if (!seat) return 0;
    return showDetails.base_price + seat.category.surcharge;
  };

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
    <div className="min-h-screen bg-[#141414] p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header mit Zurück-Button */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#2C2C2C] hover:bg-red-600/20 
                     flex items-center justify-center transition-all duration-200 group"
            aria-label="Zurück"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
        </div>

        {/* Timer-Anzeige */}
        <div className="bg-[#2C2C2C] rounded-xl p-4 flex items-center gap-2 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <p className="text-sm">
            Verbleibende Zeit: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>

        {/* Ausgewählte Sitze */}
        <div className="bg-[#2C2C2C] rounded-xl p-8 shadow-lg space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Ausgewählte Plätze</h2>
              <div className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm">
                {seats.length} {seats.length === 1 ? 'Platz' : 'Plätze'}
              </div>
            </div>

            {/* Kategorien Legende */}
            <div className="flex gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                  <Square size={12} className="text-white" />
                </div>
                <span>Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Armchair size={12} className="text-white" />
                </div>
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <Crown size={12} className="text-white" />
                </div>
                <span>VIP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {seatDetails.map((seat) => (
              <div 
                key={seat.id}
                className={`
                  p-3 rounded-lg border
                  ${seat.category_id === 1 
                    ? 'bg-emerald-600/10 border-emerald-600/20' 
                    : seat.category_id === 2 
                      ? 'bg-blue-600/10 border-blue-600/20'
                      : 'bg-purple-600/10 border-purple-600/20'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  {seat.category_id === 1 && <Square size={14} className="text-emerald-500" />}
                  {seat.category_id === 2 && <Armchair size={16} className="text-blue-500" />}
                  {seat.category_id === 3 && <Crown size={16} className="text-purple-500" />}
                  <div className="text-white text-sm font-medium">
                    Reihe {seat.row_number}, Platz {seat.seat_number}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {seat.category_id === 2 && "Premium"}
                  {seat.category_id === 3 && "VIP"}
                  {seat.category_id === 1 && "Standard"}
                  <span className="float-right text-white font-medium">
                    {calculatePrice(seat.category_id).toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kombinierte Preisübersicht */}
        <div className="bg-[#2C2C2C] rounded-xl p-8 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-white">Zusammenfassung</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-400">
              <span>Zwischensumme ({seats.length} {seats.length === 1 ? 'Platz' : 'Plätze'})</span>
              <span className="text-white">
                {seatDetails.reduce((sum, seat) => sum + calculatePrice(seat.category_id), 0).toFixed(2)} €
              </span>
            </div>
            
            <div className="flex justify-between items-center text-gray-400">
              <span>MwSt. (19%)</span>
              <span className="text-white">
                {(seatDetails.reduce((sum, seat) => sum + calculatePrice(seat.category_id), 0) * 0.19).toFixed(2)} €
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white">Gesamtbetrag</span>
                <span className="text-xl font-bold text-white">
                  {(seatDetails.reduce((sum, seat) => sum + calculatePrice(seat.category_id), 0) * 1.19).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* PayPal Button */}
          <div className="pt-6">
            <div className="max-w-md mx-auto">
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={handlePayPalApprove}
                  style={{ 
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "pay",
                    height: 55
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2C2C2C] p-8 rounded-xl shadow-xl">
            <div className="text-white text-center">
              <div className="mb-4 text-lg">Buchung wird verarbeitet...</div>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}