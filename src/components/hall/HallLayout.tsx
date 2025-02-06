"use client";
import { Square, Armchair, Crown, Ban, Clock, Users } from "lucide-react";
import { Seat } from "@/types/index";
import { useEffect, useState } from "react";
import { Show } from "@/types/show";
import { Hall } from "@/types/hall";
import { Category } from "@/types/category";

interface HallLayoutProps {
  show: Show; // Basis-/Standardpreis der Show
  onSeatSelectAction?: (seats: Seat[]) => void;
}

export function HallLayout({ show, onSeatSelectAction }: HallLayoutProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [hall, setHall] = useState<Hall | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = async () => {
    console.log("Fetching seats for show:", show);
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching seats for show:", show.show_id);
      const response = await fetch(
        `${process.env.BACKEND_URL}/shows/${show.show_id}/seats`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSeats(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Sitze:', err);
      setError('Fehler beim Laden der Sitze. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch hall details
  useEffect(() => {
    const fetchHall = async () => {
      try {
        console.log("Fetching hall with ID:", show.hall_id); // Debug log
        if (!show.hall_id) {
          console.error("No hall_id available in show:", show);
          return;
        }

        const response = await fetch(`${process.env.BACKEND_URL}/halls/${show.hall_id}`);
        if (!response.ok) {
          console.error("Hall fetch failed with status:", response.status);
          throw new Error("Saal nicht gefunden");
        }
        const hallData = await response.json();
        console.log("Hall Data:", hallData);
        setHall(hallData);
      } catch (err) {
        console.error("Fehler beim Laden der Saalinformationen:", err);
      }
    };

    if (show && show.hall_id) {
      fetchHall();
    }
  }, [show]); // Abhängigkeit von der gesamten show

  // Fetch seats effect
  useEffect(() => {
    if (show?.show_id) {  // Nur ausführen wenn show.id existiert
      fetchSeats();
      
      // Polling alle 30 Sekunden für Aktualisierungen
      const intervalId = setInterval(fetchSeats, 30000);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [show?.show_id, fetchSeats]); // fetchSeats als Abhängigkeit hinzugefügt

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/categories`);
        if (!response.ok) throw new Error("Kategorien nicht gefunden");
        const categoriesData = await response.json();
        console.log("Categories Data:", categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Fehler beim Laden der Kategorien:", err);
      }
    };

    fetchCategories();
  }, []);

  const rows = seats.length
    ? Math.max(...seats.map((seat) => seat.row_number))
    : 0;
  const seatsPerRow = seats.length
    ? Math.max(...seats.map((seat) => seat.seat_number))
    : 0;

  const handleSeatClick = (seat: Seat) => {
    if (seat.seat_status === 'BOOKED') return;

    // Statt direktem Update, bereiten wir die neue Auswahl vor
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const newSelectedSeats = isSelected
      ? selectedSeats.filter(s => s.id !== seat.id)
      : [...selectedSeats, seat];

    // Setze den lokalen State
    setSelectedSeats(newSelectedSeats);
    
    // Rufe den Callback erst NACH dem State-Update auf
    if (onSeatSelectAction) {
      // Verzögere den Callback um sicherzustellen, dass der State aktualisiert wurde
      setTimeout(() => {
        onSeatSelectAction(newSelectedSeats);
      }, 0);
    }
  };

  const isSeatSelected = (seatId: number) => {
    return selectedSeats.some((s) => s.id === seatId);
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.seat_status === 'BOOKED' || seat.seat_status === 'RESERVED') {
      return 'bg-gray-600 cursor-not-allowed';
    }
    if (isSeatSelected(seat.id)) {
      return 'bg-red-600 hover:bg-red-700';
    }
    switch (seat.category_id) {
      case 1:
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 2:
        return 'bg-blue-600 hover:bg-blue-700';
      case 3:
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600';
    }
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.seat_status === 'BOOKED' || seat.seat_status === 'RESERVED') {
      return <Ban className="w-1/2 h-1/2 text-white" />;
    }
    switch (seat.category_id) {
      case 1:
        return <Square className="w-1/2 h-1/2 text-white" />;
      case 2:
        return <Armchair className="w-1/2 h-1/2 text-white" />;
      case 3:
        return <Crown className="w-1/2 h-1/2 text-white" />;
      default:
        return null;
    }
  };

  // Funktion zum Berechnen des Gesamtpreises für eine Kategorie
  const getTotalPrice = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return show.base_price + (category?.surcharge || 0);
  };

  if (isLoading && seats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Lädt...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 mb-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchSeats}
          className="mt-2 text-red-400 hover:text-red-300 text-sm"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Panel */}
      <div className="bg-[#1C1C1C] p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm text-gray-400">Vorstellung</div>
              <div className="text-white">
                {new Date(show.start_time).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} Uhr
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm text-gray-400">Saal</div>
              <div className="text-white">{hall?.name || "Lädt..."}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 text-red-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Kapazität</div>
              <div className="text-white">{hall?.seating_capacity || "..."} Plätze</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 text-red-500 flex items-center justify-center font-bold">€</div>
            <div>
              <div className="text-sm text-gray-400">Grundpreis</div>
              <div className="text-white">{show.base_price.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leinwand */}
      <div className="w-full h-8 bg-red-600 flex items-center justify-center rounded-md">
        <span className="text-white font-medium">LEINWAND</span>
      </div>

      {/* Sitzplan */}
      <div className="bg-[#1C1C1C] p-4 rounded-lg">
        <div className="flex flex-col items-center">
          {/* Container mit dynamischer Breite */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Nummerierung oben */}
            <div className="grid" style={{
              gridTemplateColumns: `30px repeat(${seatsPerRow}, 1fr)`,
              gap: '4px'
            }}>
              <div /> {/* Platz für Reihenbezeichnung */}
              {Array.from({ length: seatsPerRow }, (_, i) => (
                <div key={i} className="text-center text-gray-400 text-[10px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Sitzreihen */}
            <div className="space-y-1 mt-2">
              {Array.from({ length: rows }, (_, row) => (
                <div key={row} className="grid items-center" style={{
                  gridTemplateColumns: `30px repeat(${seatsPerRow}, 1fr)`,
                  gap: '4px'
                }}>
                  {/* Reihenbezeichnung links */}
                  <div className="text-center text-gray-400 text-[10px]">
                    {row + 1}
                  </div>

                  {/* Sitze in der Reihe */}
                  {Array.from({ length: seatsPerRow }, (_, seat) => {
                    const seatData = seats.find(
                      (s) => s.row_number === row + 1 && s.seat_number === seat + 1
                    );

                    if (!seatData) {
                      return <div key={seat} className="aspect-square" />;
                    }

                    return (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seatData)}
                        disabled={seatData.seat_status === 'BOOKED'}
                        className={`
                          aspect-square rounded flex items-center justify-center
                          transition-all duration-200
                          ${getSeatColor(seatData)}
                          ${selectedSeats.some((s) => s.id === seatData.id) 
                            ? 'ring-2 ring-white scale-105' 
                            : ''}
                          disabled:opacity-50 disabled:cursor-not-allowed
                          disabled:hover:scale-100
                          hover:z-10
                        `}
                      >
                        {getSeatIcon(seatData)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
        {categories.map(category => (
          <div key={category.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded flex items-center justify-center
              ${category.id === 1 ? 'bg-emerald-600' : 
                category.id === 2 ? 'bg-blue-600' : 'bg-purple-600'}`}
            >
              {category.id === 1 && <Square size={12} className="text-white" />}
              {category.id === 2 && <Armchair size={14} className="text-white" />}
              {category.id === 3 && <Crown size={14} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span>{category.category_name}</span>
              {category.surcharge > 0 && (
                <span className="text-xs">(+{category.surcharge.toFixed(2)} €)</span>
              )}
              <span className="text-xs">{getTotalPrice(category.id).toFixed(2)} €</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
            <Ban size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span>Belegt/Reserviert</span>
            <span className="text-xs">Nicht verfügbar</span>
          </div>
        </div>
      </div>

      {/* Ausgewählte Sitze */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 bg-[#1C1C1C] rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">
                Ausgewählte Sitze
              </h3>
              <div className="text-sm text-gray-400">
                ({selectedSeats.length} {selectedSeats.length === 1 ? 'Platz' : 'Plätze'})
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedSeats
                .sort((a, b) =>
                  a.row_number === b.row_number
                    ? a.seat_number - b.seat_number
                    : a.row_number - b.row_number
                )
                .map((seat) => {
                  const price = getTotalPrice(seat.category_id);
                  return (
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
                          {price.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {selectedSeats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="text-gray-400">Gesamtpreis:</div>
                <div className="text-xl font-semibold text-white">
                  {selectedSeats
                    .reduce((total, seat) => total + getTotalPrice(seat.category_id), 0)
                    .toFixed(2)} €
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
