'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ChevronLeft, 
  Download,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import '@/styles/fonts.css';  // Erstelle diese Datei für die Schriftart

import type {
  BookingDetails,
  User,
  TransferStatus,
  ConfirmationData,
  Friendship
} from '@/types/index';

const FALLBACK_USER_ID = '2ede4bfb-87c0-4681-9a01-7f9557dd16de';

export default function ConfirmationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [transferStatuses, setTransferStatuses] = useState<Map<number, TransferStatus>>(new Map());
  const [countdowns, setCountdowns] = useState<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const fetchConfirmationData = async () => {
      try {
        const currentUserId = session?.user?.id || FALLBACK_USER_ID;
        
        // 1. Payment-Details
        const paymentResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/payments/${params.paymentId}`
        );
        if (!paymentResponse.ok) throw new Error('Zahlungsdetails nicht gefunden');
        const paymentData = await paymentResponse.json();

        // 2. Buchungen
        const bookingsResponse = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/payment/${params.paymentId}`
        );
        if (!bookingsResponse.ok) throw new Error('Buchungen nicht gefunden');
        const bookingsData = await bookingsResponse.json();

        // 3. Für jede Buchung: Details laden
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: BookingDetails) => {
            // Wichtig: Setze die user_id auf den aktuellen Benutzer für neue Buchungen
            const bookingWithUserId = {
              ...booking,
              user_id: booking.user_id || currentUserId // Wenn keine user_id gesetzt ist, nutze currentUserId
            };

            // Rest der Logik bleibt gleich
            const seatResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/seats/${booking.seat_id}`
            );
            const seatData = await seatResponse.json();

            const categoryResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/categories/${seatData.category_id}`
            );
            const categoryData = await categoryResponse.json();

            const showResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/shows/${booking.show_id}`
            );
            const showData = await showResponse.json();

            const movieResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/movies/${showData.movie_id}`
            );
            const movieData = await movieResponse.json();

            return {
              ...bookingWithUserId,
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

        console.log('Enriched Bookings mit user_id:', enrichedBookings);

        // Lade die Freunde mit FALLBACK_USER_ID wenn keine Session existiert
        const userId = session?.user?.id || FALLBACK_USER_ID;
        await loadFriends(userId);

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
  }, [params.paymentId, session]);

  const loadFriends = async (userId: string) => {
    try {
      const friendshipsResponse = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/friendships/user/${userId}`
      );
      const friendships: Friendship[] = await friendshipsResponse.json();

      const friendsData = await Promise.all(
        friendships.map(async (friendship) => {
          const friendId = friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;
          const userResponse = await fetch(
            `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/users/${friendId}`
          );
          return await userResponse.json();
        })
      );

      setFriends(friendsData);
    } catch (error) {
      console.error('Fehler beim Laden der Freunde:', error);
    }
  };

  const transferBooking = async (bookingId: number, newUserId: string) => {
    try {
      const currentUserId = session?.user?.id || FALLBACK_USER_ID;
      
      if (!selectedBooking) {
        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: 'Keine Buchung ausgewählt.',
          isSuccess: false
        }));
        return;
      }

      // Prüfen ob der aktuelle Benutzer der Besitzer ist
      if (selectedBooking.user_id !== currentUserId) {
        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: 'Sie sind nicht berechtigt, diese Buchung zu übertragen.',
          isSuccess: false
        }));
        return;
      }

      const originalUserId = selectedBooking.user_id;
      
      // Nur die notwendigen Felder senden
      const updatedBooking = {
        id: bookingId,
        user_id: newUserId,
        seat_id: selectedBooking.seat_id,
        show_id: selectedBooking.show_id,
        payment_id: selectedBooking.payment_id,
        token: selectedBooking.token
      };

      const response = await fetch(
        `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBooking),
        }
      );

      if (response.ok) {
        setTransferStatuses(prev => new Map(prev).set(bookingId, {
          message: 'Buchung erfolgreich übertragen!',
          isSuccess: true,
          countdown: 5,
          originalUserId
        }));

        // Starte Countdown
        const timeoutId = setTimeout(() => {
          setTransferStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(bookingId);
            return newMap;
          });
        }, 5000);

        setCountdowns(prev => new Map(prev).set(bookingId, timeoutId));
        setShowModal(false);

        // Update die lokalen Buchungsdaten
        if (confirmationData) {
          setConfirmationData({
            ...confirmationData,
            bookings: confirmationData.bookings.map(booking =>
              booking.id === bookingId ? { ...booking, user_id: newUserId } : booking
            )
          });
        }
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setTransferStatuses(prev => new Map(prev).set(bookingId, {
        message: 'Fehler beim Übertragen der Buchung.',
        isSuccess: false
      }));
    }
  };

  // Vereinfachte Funktion zum Prüfen, ob eine Buchung übertragen wurde
  const isBookingTransferred = (booking: BookingDetails) => {
    const currentUserId = session?.user?.id || FALLBACK_USER_ID;
    return booking.user_id !== currentUserId;
  };

  // Vereinfachte Click-Handler
  const handleBookingClick = (booking: BookingDetails) => {
    if (!isBookingTransferred(booking)) {
      setSelectedBooking(booking);
      setShowModal(true);
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

  const { payment, bookings } = confirmationData;
  const firstBooking = bookings[0];

  // Render der Buchungskarten
  const renderBookingCard = (booking: BookingDetails) => {
    const isTransferred = isBookingTransferred(booking);
    const transferredFriend = isTransferred ? friends.find(f => f.id === booking.user_id) : null;

    return (
      <div 
        key={booking.id} 
        className={`
          p-4 rounded-lg border
          ${!isTransferred ? 'cursor-pointer hover:scale-[1.02] transition-all duration-200' : ''}
          ${booking.seat?.category?.category_name === 'Standard' 
            ? `bg-emerald-600/10 border-emerald-600/20 ${!isTransferred ? 'hover:bg-emerald-600/20' : ''}`
            : booking.seat?.category?.category_name === 'Premium'
              ? `bg-blue-600/10 border-blue-600/20 ${!isTransferred ? 'hover:bg-blue-600/20' : ''}`
              : `bg-purple-600/10 border-purple-600/20 ${!isTransferred ? 'hover:bg-purple-600/20' : ''}`}
        `}
        onClick={() => handleBookingClick(booking)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              Reihe {booking.seat?.row_number}, Platz {booking.seat?.seat_number}
            </p>
            <p className="text-sm text-gray-400">
              {booking.seat?.category?.category_name || 'Standard'}
            </p>
            {isTransferred && transferredFriend && (
              <p className="text-sm text-gray-400 mt-1">
                Übertragen an {transferredFriend.firstName} {transferredFriend.lastName}
              </p>
            )}
          </div>
          <div className="text-gray-400">
            {!isTransferred ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Component
  const TicketModal = ({ booking, onClose }: { booking: BookingDetails; onClose: () => void }) => {
    const [showFriendsList, setShowFriendsList] = useState(false);
    const [friends, setFriends] = useState<User[]>([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);

    // Lade Freunde wenn der Transfer-Button geklickt wird
    const loadFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const currentUserId = session?.user?.id || FALLBACK_USER_ID;
        const response = await fetch(
          `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/friendships/user/${currentUserId}`
        );
        const friendships: Friendship[] = await response.json();

        // Lade Details für jeden Freund
        const friendsData = await Promise.all(
          friendships.map(async (friendship) => {
            const friendId = friendship.user1Id === currentUserId ? friendship.user2Id : friendship.user1Id;
            const userResponse = await fetch(
              `${process.env.BACKEND_URL ?? 'http://localhost:8000'}/users/${friendId}`
            );
            return await userResponse.json();
          })
        );

        setFriends(friendsData);
      } catch (error) {
        console.error('Fehler beim Laden der Freunde:', error);
      } finally {
        setIsLoadingFriends(false);
      }
    };

    // Zusätzliche Sicherheitsprüfung
    if (isBookingTransferred(booking)) {
      onClose();
      return null;
    }

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-[#2C2C2C] p-8 rounded-xl shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">Ticket Details</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showFriendsList ? (
              // Normales Ticket-Modal
              <>
                <div className="mb-6 space-y-2 text-gray-300">
                  <p>Film: <span className="text-white">{booking.show?.movie?.title}</span></p>
                  <p>Sitzplatz: <span className="text-white">Reihe {booking.seat?.row_number}, Platz {booking.seat?.seat_number}</span></p>
                  <p>Kategorie: <span className="text-white">{booking.seat?.category?.category_name}</span></p>
                </div>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <div className="flex justify-center">
                    <QRCode
                      id={`qr-code-preview-${booking.id}`}
                      value={JSON.stringify({
                        booking_id: booking.id,
                        token: booking.token
                      })}
                      size={200}
                      level="H"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => createQRCodeWithInfo(booking)}
                    className="w-full py-3 bg-red-600 text-white rounded-lg 
                             hover:bg-red-700 transition-all duration-200 
                             flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Ticket herunterladen
                  </button>

                  <button
                    onClick={() => {
                      loadFriends();
                      setShowFriendsList(true);
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-all duration-200 
                             flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Ticket übertragen
                  </button>
                </div>
              </>
            ) : (
              // Freundesliste für Transfer
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white mb-4">Wähle einen Freund aus</h4>
                
                {isLoadingFriends ? (
                  <div className="text-center text-gray-400 py-4">
                    Lade Freunde...
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    Keine Freunde gefunden
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => {
                          transferBooking(booking.id, friend.id);
                          onClose();
                        }}
                        className="w-full p-4 bg-[#3C3C3C] rounded-lg hover:bg-[#4C4C4C] 
                                 transition-colors text-left flex items-center justify-between"
                      >
                        <span className="text-white">{friend.firstName} {friend.lastName}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowFriendsList(false)}
                  className="w-full py-3 bg-gray-600 text-white rounded-lg 
                           hover:bg-gray-700 transition-all duration-200 mt-4"
                >
                  Zurück
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const createQRCodeWithInfo = (booking: BookingDetails) => {
    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Dunkler Hintergrund mit Farbverlauf
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1C1C1C");
    gradient.addColorStop(1, "#2C2C2C");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Roter Header mit Farbverlauf
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, "#DC2626");
    headerGradient.addColorStop(1, "#991B1B");
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 180);

    // Logo/Header Text mit verstärktem Schatten
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "bold 52px Montserrat";  // Größer und Montserrat
    ctx.fillText("CinemaPlus", width/2, 80);

    // Dekorative Elemente
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#DC2626";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 8]);
    ctx.beginPath();
    ctx.moveTo(50, 220);
    ctx.lineTo(width - 50, 220);
    ctx.stroke();

    // Film-Titel
    ctx.shadowColor = "rgba(220, 38, 38, 0.2)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Montserrat";  // Größer und Montserrat
    ctx.fillText(booking.show?.movie?.title || '', width/2, 280);

    // Datum & Zeit
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "500 24px Montserrat";  // Montserrat mit medium weight
    const dateStr = new Date(booking.show?.start_time).toLocaleString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = new Date(booking.show?.start_time).toLocaleString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    ctx.fillText(dateStr, width/2, 330);
    ctx.fillText(timeStr + ' Uhr', width/2, 370);

    // QR Code Container - kleinere Box
    const qrSize = 350;  // Größe der weißen Box
    const qrCodeSize = 270;  // QR-Code selbst wird kleiner
    const cornerRadius = 20;

    // Funktion für abgerundete Rechtecke
    const roundRect = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      width: number, 
      height: number, 
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Weißer Container mit abgerundeten Ecken
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 225, 420, qrSize, qrSize, cornerRadius);
    ctx.fill();

    // QR Code mit JSON-Objekt
    const svgElement = document.getElementById(`qr-code-preview-${booking.id}`);
    if (svgElement instanceof SVGElement) {
      const qrData = JSON.stringify({
        booking_id: booking.id,
        token: booking.token
      });
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      img.onload = () => {
        // Zentriere den kleineren QR-Code in der weißen Box
        const xOffset = 225 + (qrSize - qrCodeSize) / 2;
        const yOffset = 420 + (qrSize - qrCodeSize) / 2;
        ctx.drawImage(img, xOffset, yOffset, qrCodeSize, qrCodeSize);

        // Sitzplatz Details
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 34px Montserrat";
        ctx.fillText(
          `Reihe ${booking.seat?.row_number}, Platz ${booking.seat?.seat_number}`,
          width/2,
          900
        );
        
        const categoryColors: { [key: string]: string } = {
          'Standard': '#059669',
          'Premium': '#2563EB',
          'VIP': '#7C3AED'
        };

        ctx.fillStyle = categoryColors[booking.seat?.category?.category_name || 'Standard'];
        ctx.font = "600 26px Montserrat";
        ctx.fillText(
          booking.seat?.category?.category_name || 'Standard',
          width/2,
          935
        );

        // Footer
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "500 20px Montserrat";
        ctx.fillText(
          "Bitte zeigen Sie dieses Ticket beim Einlass vor",
          width/2,
          980
        );

        // Download wieder hinzufügen
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `CinemaPlus-${booking.show?.movie?.title}-Reihe${booking.seat?.row_number}-Platz${booking.seat?.seat_number}.png`
          .replace(/[^a-z0-9-]/gi, '_'); // Ersetze ungültige Dateinamen-Zeichen
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] p-4 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Grid Layout für die Content-Bereiche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Header - volle Breite */}
          <div className="lg:col-span-2 bg-[#2C2C2C] rounded-xl p-8 shadow-lg text-center space-y-4">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Ticket className="w-6 h-6 text-red-500" />
              Buchungsbestätigung
            </h1>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {firstBooking.show?.movie?.title || 'Unbekannter Film'}
              </h2>
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                {firstBooking.show?.start_time ? 
                  new Date(firstBooking.show.start_time).toLocaleString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 
                  'Datum unbekannt'
                }
                <Clock className="w-4 h-4 ml-2" />
                {firstBooking.show?.start_time ? 
                  new Date(firstBooking.show.start_time).toLocaleString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) + ' Uhr' : 
                  'Zeit unbekannt'
                }
              </p>
            </div>
          </div>

          {/* Zahlungsdetails - halbe Breite */}
          <div className="bg-[#2C2C2C] rounded-xl p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-500" />
              Zahlungsdetails
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-400">
                <span>Gesamtbetrag</span>
                <span className="text-white font-medium">{payment.amount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>MwSt.</span>
                <span className="text-white font-medium">{payment.tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Zahlungsmethode</span>
                <span className="text-white font-medium">{payment.payment_method}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {payment.payment_status}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Datum</span>
                <span className="text-white font-medium">
                  {new Date(payment.payment_time).toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          </div>

          {/* Gebuchte Plätze - halbe Breite */}
          <div className="bg-[#2C2C2C] rounded-xl p-8 shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Gebuchte Plätze</h3>
            <div className="grid grid-cols-1 gap-4">
              {bookings.map(booking => renderBookingCard(booking))}
            </div>
          </div>
        </div>

        {/* Zurück zum Hauptmenü Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/programm')}
            className="px-8 py-3 bg-red-600 text-white rounded-lg 
                     hover:bg-red-700 transition-all duration-200 
                     transform hover:scale-105 font-medium
                     flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Zurück zum Hauptmenü
          </button>
        </div>

        {/* Debug-Anzeige */}
        <div className="hidden">
          Debug: Modal should be {showModal ? 'visible' : 'hidden'}, 
          Booking selected: {selectedBooking ? 'yes' : 'no'}
        </div>

        {/* Modal */}
        {showModal && selectedBooking && (
          <TicketModal 
            booking={selectedBooking} 
            onClose={() => {
              setShowModal(false);
              setSelectedBooking(null);
            }}
          />
        )}
      </div>
    </div>
  );
}