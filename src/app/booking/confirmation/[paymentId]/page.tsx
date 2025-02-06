'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  // Funktion zum Erstellen eines schönen QR-Code Downloads
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

    // QR Code
    const svgElement = document.getElementById(`qr-code-preview-${booking.id}`);
    if (svgElement instanceof SVGElement) {
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

  // Neue Funktion für die Ticket-Vorschau
  const TicketPreview = ({ booking }: { booking: BookingDetails }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 1000;

      const renderTicket = async () => {
        // Dunkler Hintergrund mit Farbverlauf
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1C1C1C");
        gradient.addColorStop(1, "#2C2C2C");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Roter Header mit Farbverlauf
        const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        headerGradient.addColorStop(0, "#DC2626");
        headerGradient.addColorStop(1, "#991B1B");
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvas.width, 180);

        // Logo/Header Text mit verstärktem Schatten
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "bold 52px Montserrat";  // Größer und Montserrat
        ctx.fillText("CinemaPlus", canvas.width/2, 80);

        // Dekorative Elemente
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#DC2626";
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 8]);
        ctx.beginPath();
        ctx.moveTo(50, 220);
        ctx.lineTo(canvas.width - 50, 220);
        ctx.stroke();

        // Film-Titel
        ctx.shadowColor = "rgba(220, 38, 38, 0.2)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 36px Montserrat";  // Größer und Montserrat
        ctx.fillText(booking.show?.movie?.title || '', canvas.width/2, 280);

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
        ctx.fillText(dateStr, canvas.width/2, 330);
        ctx.fillText(timeStr + ' Uhr', canvas.width/2, 370);

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

        // QR Code
        const svgElement = document.getElementById(`qr-code-preview-${booking.id}`);
        if (svgElement instanceof SVGElement) {
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
              canvas.width/2,
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
              canvas.width/2,
              935
            );

            // Footer
            ctx.fillStyle = "#9CA3AF";
            ctx.font = "500 20px Montserrat";
            ctx.fillText(
              "Bitte zeigen Sie dieses Ticket beim Einlass vor",
              canvas.width/2,
              980
            );
          };
          img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
      };

      renderTicket();
    }, [booking]);

    return (
      <div className="relative">
        <canvas ref={canvasRef} className="w-full rounded-lg" />
        <div className="hidden">
          <QRCode 
            id={`qr-code-preview-${booking.id}`}
            value={JSON.stringify({
              bookingId: booking.id,
              token: booking.token
            })}
            size={200}
            level="H"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#141414] p-4">
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
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowModal(true);
                  }}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all duration-200
                    hover:scale-[1.02]
                    ${booking.seat?.category?.category_name === 'Standard' 
                      ? 'bg-emerald-600/10 border-emerald-600/20 hover:bg-emerald-600/20' 
                      : booking.seat?.category?.category_name === 'Premium'
                        ? 'bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20'
                        : 'bg-purple-600/10 border-purple-600/20 hover:bg-purple-600/20'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        Reihe {booking.seat?.row_number}, Platz {booking.seat?.seat_number}
                      </p>
                      <p className="text-sm text-gray-400">
                        {booking.seat?.category?.category_name || 'Standard'}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Ticket Preview Modal */}
        {showModal && selectedBooking && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-[#2C2C2C] rounded-xl p-3 shadow-xl max-w-md w-full space-y-2"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base font-bold text-white">Ticket</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ticket Preview */}
              <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
                <TicketPreview booking={selectedBooking} />
              </div>

              {/* Download Button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => {
                    const svg = document.getElementById(`qr-code-preview-${selectedBooking.id}`);
                    if (svg instanceof SVGElement) {
                      createQRCodeWithInfo(selectedBooking);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg 
                           hover:bg-red-700 transition-all duration-200 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
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