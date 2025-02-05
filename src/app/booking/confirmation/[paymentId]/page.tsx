'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type {
  BookingDetails,
  User,
  TransferStatus,
  ConfirmationData,
  Friendship
} from '@/types';

const FALLBACK_USER_ID = '2ede4bfb-87c0-4681-9a01-7f9557dd16de';

export default function ConfirmationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [transferStatuses, setTransferStatuses] = useState<Map<number, TransferStatus>>(new Map());
  const [countdowns, setCountdowns] = useState<Map<number, NodeJS.Timeout>>(new Map());
  const [bookings, setBookings] = useState<BookingDetails[]>([]);

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

        // 3. Für jede Buchung: Sitze, Shows und Movies laden
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: BookingDetails) => {
            // Seat Details
            const seatResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${booking.seat_id}`
            );
            const seatData = await seatResponse.json();

            // Kategorie Details direkt laden
            const categoryResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`
            );
            const categoryData = await categoryResponse.json();

            // Show Details
            const showResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${booking.show_id}`
            );
            const showData = await showResponse.json();

            // Movie Details laden
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

  // Setze die Buchungen initial aus den confirmationData
  useEffect(() => {
    if (confirmationData) {
      setBookings(confirmationData.bookings);
    }
  }, [confirmationData]);

  // Neue Funktion zum Laden der Freunde
  const loadFriends = async (userId: string) => {
    if (!userId) {
      console.error('Keine User-ID verfügbar');
      return;
    }

    try {
      console.log('Loading friends for user:', userId);
      const friendshipsResponse = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/friendships/user/${userId}`
      );
      const friendships: Friendship[] = await friendshipsResponse.json();

      // Lade Details für jeden Freund
      const friendsData = await Promise.all(
        friendships.map(async (friendship) => {
          const friendId = friendship.user1Id === userId 
            ? friendship.user2Id 
            : friendship.user1Id;
          
          const userResponse = await fetch(
            `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/users/${friendId}`
          );
          return await userResponse.json();
        })
      );

      console.log('Final friends data:', friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Fehler beim Laden der Freunde:', error);
    }
  };

  const undoTransfer = async (bookingId: number, originalUserId: string) => {
    // Countdown stoppen
    const timeoutId = countdowns.get(bookingId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setCountdowns(prev => {
        const newMap = new Map(prev);
        newMap.delete(bookingId);
        return newMap;
      });
    }

    // Buchung zurück übertragen
    try {
      const updatedBooking = {
        id: bookingId,
        show_id: selectedBooking?.show_id,
        user_id: originalUserId,
        seat_id: selectedBooking?.seat_id,
        payment_id: selectedBooking?.payment_id,
        token: selectedBooking?.token
      };

      const response = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedBooking),
        }
      );

      if (response.ok) {
        // Update das lokale Booking-Array zurück
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, user_id: originalUserId }
              : booking
          )
        );

        setTransferStatuses(prev => {
          const newMap = new Map(prev);
          newMap.delete(bookingId);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Undo transfer error:', error);
    }
  };

  const transferBooking = async (bookingId: number, newUserId: string) => {
    try {
      if (!selectedBooking) {
        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: 'Keine Buchung ausgewählt.',
          isSuccess: false
        }));
        return;
      }

      const originalUserId = selectedBooking.user_id;
      const updatedBooking = {
        id: bookingId,
        show_id: selectedBooking.show_id,
        user_id: newUserId,
        seat_id: selectedBooking.seat_id,
        payment_id: selectedBooking.payment_id,
        token: selectedBooking.token
      };

      const response = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedBooking),
        }
      );

      if (response.ok) {
        // Update das lokale Booking-Array
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, user_id: newUserId }
              : booking
          )
        );

        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: 'Buchung erfolgreich übertragen!',
          isSuccess: true,
          countdown: 10,
          originalUserId
        }));
        setShowModal(false);


        let countdown = 10;
        const intervalId = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            setTransferStatuses(prev => {
              const newMap = new Map(prev);
              const status = newMap.get(bookingId);
              if (status) {
                newMap.set(bookingId, { ...status, countdown });
              }
              return newMap;
            });
          } else {
            clearInterval(intervalId);
            setTransferStatuses(prev => {
              const newMap = new Map(prev);
              newMap.delete(bookingId);
              return newMap;
            });
          }
        }, 1000);

        // Speichere den Interval für mögliches Abbrechen
        setCountdowns(prev => new Map(prev).set(bookingId, intervalId));
      } else {
        const errorData = await response.json();
        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: `Fehler beim Übertragen der Buchung: ${errorData.message}`,
          isSuccess: false
        }));
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setTransferStatuses(prev => new Map(prev).set(bookingId, {
        message: 'Fehler beim Übertragen der Buchung.',
        isSuccess: false
      }));
    }
  };

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

  const { payment, bookings: fetchedBookings } = confirmationData;
  const firstBooking = fetchedBookings[0];

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
            >
              <div className="flex-grow">
                <p className="font-medium">
                  Reihe {booking.seat?.row_number}, Platz {booking.seat?.seat_number}
                  <span className="ml-2 text-gray-600">
                    ({booking.seat?.category?.category_name || 'Standard'})
                  </span>
                </p>
                {transferStatuses.get(booking.id) && (
                  <div className="mt-2">
                    <p className={`text-sm ${
                      transferStatuses.get(booking.id)?.isSuccess 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transferStatuses.get(booking.id)?.message}
                      {transferStatuses.get(booking.id)?.countdown && (
                        <span className="ml-2">
                          ({transferStatuses.get(booking.id)?.countdown}s)
                        </span>
                      )}
                    </p>
                    {transferStatuses.get(booking.id)?.isSuccess && (
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                        onClick={() => undoTransfer(
                          booking.id, 
                          transferStatuses.get(booking.id)?.originalUserId || ''
                        )}
                      >
                        Rückgängig machen
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div 
                className={`text-gray-400 ${
                  booking.user_id !== (session?.user?.id || FALLBACK_USER_ID) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (booking.user_id === (session?.user?.id || FALLBACK_USER_ID)) {
                    setSelectedBooking(booking);
                    setShowModal(true);
                    loadFriends(session?.user?.id || FALLBACK_USER_ID);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Modal für QR Code - Update */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
               onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
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

              {/* Freunde-Auswahl */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">An Freund übertragen:</h4>
                <select 
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const friend = friends.find(f => f.id === selectedId);
                    setSelectedFriend(friend || null);
                  }}
                  value={selectedFriend?.id || ''}
                >
                  <option value="">Freund auswählen...</option>
                  {friends.map(friend => (
                    <option key={friend.id} value={friend.id}>
                      {friend.firstName} {friend.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <button 
                  className={`w-full py-2 ${
                    selectedFriend 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white rounded transition-colors`}
                  disabled={!selectedFriend}
                  onClick={() => selectedFriend && transferBooking(selectedBooking.id, selectedFriend.id)}
                >
                  Übertragen
                </button>
                <button 
                  className="w-full py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 