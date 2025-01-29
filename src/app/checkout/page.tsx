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
    [x: string]: any;
    surcharge: any;
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
  const [showDetails, setShowDetails] = useState<any>(null);

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

  const createBookings = async (paymentId: string) => {
    console.log('Creating bookings for seats:', seats);
    
    // Sitzpreise berechnen mit base_price + surcharge
    const bookingRequest = seats.map(seatId => {
      const seatDetail = seatDetails.find(detail => detail.id === seatId);
      if (!seatDetail) throw new Error(`Sitzdetails für Sitz ${seatId} nicht gefunden`);
      
      const price = showDetails.base_price + (seatDetail.category?.surcharge || 0);
      
      return {
        seat_id: seatId,
        show_id: showId,
        user_id: 1, // TODO: Dynamischer User
        payment_id: paymentId,
        price_eur: price // Preis in EUR (z.B. 15.00)
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
  };

  const calculateTotal = () => {
    if (!showDetails || !seatDetails.length) return 0;
    return seatDetails.reduce((total, seat) => {
      const seatPrice = showDetails.base_price + (seat.category?.surcharge || 0);
      return total + seatPrice;
    }, 0);
  };

  useEffect(() => {
    const loadPayPalScript = async () => {
      // Warten bis alle Daten geladen sind
      if (!showDetails || !seatDetails.length || seatDetails.some(seat => !seat.category)) {
        console.log('Warte auf vollständige Daten...', { showDetails, seatDetails });
        return;
      }
      if (paypalInitialized) return;

      try {
        setPaypalInitialized(true);
        
        // @ts-ignore
        await window.paypal?.Buttons({
          createOrder: (data: any, actions: any) => {
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

            return actions.order.create({
              intent: "CAPTURE",
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
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              setIsLoading(true);
              const paypalDetails = await actions.order.capture();
              console.log('PayPal payment captured:', paypalDetails);

              // 1. Create payment
              const totalAmount = calculateTotal();
              const payment = {
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

              console.log('Creating payment with data:', payment);

              const paymentResponse = await fetch(
                `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments`, 
                {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payment)
                }
              );

              if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                console.error('Payment error response:', errorText);
                throw new Error(`Payment creation failed: ${errorText}`);
              }

              const createdPayment = await paymentResponse.json();
              console.log('Payment created:', createdPayment);

              // 2. Create bookings
              await createBookings(createdPayment.id);

              router.push(`/booking/confirmation/${createdPayment.id}`);
            } catch (error) {
              console.error('Full error:', error);
              alert('Ein Fehler ist aufgetreten. Bitte kontaktieren Sie den Support.');
            } finally {
              setIsLoading(false);
            }
          }
        }).render('#paypal-button-container');
      } catch (error) {
        console.error('PayPal Initialisierungsfehler:', error);
        setPaypalInitialized(false);
      }
    };

    loadPayPalScript();
  }, [showDetails, seatDetails, paypalInitialized]);

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      {showId && seats.length > 0 && (
        <Script 
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&merchant-id=${merchantId}`}
          strategy="afterInteractive"
        />
      )}
      
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
