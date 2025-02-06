'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { ChevronLeft, Download, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { BookingDetailsWithPayment as Booking } from '@/types/booking-details-payment';


export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) return;

      try {
        // 1. Basis-Buchungen holen
        const response = await fetch(`${process.env.BACKEND_URL}/users/${session.user.id}/bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const bookingsData = await response.json();

        // 2. Für jede Buchung: Details laden
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: Booking) => {
            // Seat Details
            const seatResponse = await fetch(`${process.env.BACKEND_URL}/seats/${booking.seat_id}`);
            const seatData = await seatResponse.json();

            // Kategorie Details
            const categoryResponse = await fetch(`${process.env.BACKEND_URL}/categories/${seatData.category_id}`);
            const categoryData = await categoryResponse.json();

            // Show Details
            const showResponse = await fetch(`${process.env.BACKEND_URL}/shows/${booking.show_id}`);
            const showData = await showResponse.json();

            // Movie Details
            const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${showData.movie_id}`);
            const movieData = await movieResponse.json();

            // Kombiniere alle Daten
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

        console.log('Angereicherte Buchungen:', enrichedBookings);
        setBookings(enrichedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-pulse text-red-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/profile')}
            className="text-white hover:text-red-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Meine Buchungen</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#2C2C2C] rounded-xl p-6 hover:bg-[#3C3C3C] transition-all duration-200 cursor-pointer"
              onClick={() => {
                setSelectedBooking(booking);
                setShowModal(true);
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    {booking.show?.movie?.title ?? 'Unbekannter Film'}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.show?.start_time ? 
                        new Date(booking.show.start_time).toLocaleDateString('de-DE') :
                        'Kein Datum'
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.show?.start_time ? 
                        new Date(booking.show.start_time).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) :
                        'Keine Zeit'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Sitzplatz</div>
                    <div className="text-white">
                      Reihe {booking.seat?.row_number ?? '?'}, 
                      Platz {booking.seat?.seat_number ?? '?'}
                    </div>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${booking.seat?.category?.category_name === 'Standard' 
                      ? 'bg-emerald-600/10 text-emerald-500' 
                      : booking.seat?.category?.category_name === 'Premium'
                        ? 'bg-blue-600/10 text-blue-500'
                        : 'bg-purple-600/10 text-purple-500'}
                  `}>
                    {booking.seat?.category?.category_name ?? 'Standard'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Keine Buchungen gefunden
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        {showModal && selectedBooking && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-[#2C2C2C] rounded-xl p-6 shadow-xl max-w-md w-full space-y-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Ticket Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ticket Content */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-white">
                    {selectedBooking.show?.movie?.title}
                  </h4>
                  <div className="text-gray-400 flex items-center justify-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedBooking.show?.start_time).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedBooking.show?.start_time).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} Uhr
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <QRCode
                    id={`qr-code-${selectedBooking.id}`}
                    value={JSON.stringify({
                      bookingId: selectedBooking.id,
                      token: selectedBooking.token
                    })}
                    size={200}
                    level="H"
                  />
                </div>

                {/* Sitzplatz Info */}
                <div className="text-center space-y-2">
                  <div className="text-white text-lg font-medium">
                    Reihe {selectedBooking.seat?.row_number}, 
                    Platz {selectedBooking.seat?.seat_number}
                  </div>
                  <div className={`
                    inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${selectedBooking.seat?.category?.category_name === 'Standard' 
                      ? 'bg-emerald-600/10 text-emerald-500' 
                      : selectedBooking.seat?.category?.category_name === 'Premium'
                        ? 'bg-blue-600/10 text-blue-500'
                        : 'bg-purple-600/10 text-purple-500'}
                  `}>
                    {selectedBooking.seat?.category?.category_name}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    const svg = document.getElementById(`qr-code-${selectedBooking.id}`);
                    if (svg instanceof SVGElement) {
                      createQRCodeWithInfo(selectedBooking);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-red-600 text-white rounded-lg hover:bg-red-700 
                             transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Ticket herunterladen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Funktion zum Erstellen des QR-Code Downloads
const createQRCodeWithInfo = (booking: Booking) => {
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

  // Roter Header
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, "#DC2626");
  headerGradient.addColorStop(1, "#991B1B");
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, width, 180);

  // Logo Text
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = "bold 52px Montserrat";
  ctx.fillText("CinemaPlus", width/2, 80);

  // Film-Titel
  ctx.shadowColor = "rgba(220, 38, 38, 0.2)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 36px Montserrat";
  ctx.fillText(booking.show?.movie?.title || '', width/2, 280);

  // Datum & Zeit
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "500 24px Montserrat";
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

  // QR Code
  const svgElement = document.getElementById(`qr-code-${booking.id}`);
  if (svgElement instanceof SVGElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, (width - 300) / 2, 420, 300, 300);

      // Sitzplatz Details
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 34px Montserrat";
      ctx.fillText(
        `Reihe ${booking.seat?.row_number}, Platz ${booking.seat?.seat_number}`,
        width/2,
        800
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
        850
      );

      // Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `CinemaPlus-${booking.show?.movie?.title}-Reihe${booking.seat?.row_number}-Platz${booking.seat?.seat_number}.png`
        .replace(/[^a-z0-9-]/gi, '_');
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }
};