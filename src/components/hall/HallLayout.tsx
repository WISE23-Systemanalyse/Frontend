"use client";
import { Square, Armchair, Crown, Ban } from "lucide-react";
import { Seat } from "@/types/index";
import { useEffect, useState } from "react";

interface HallLayoutProps {
  showID: number;
  onSeatSelect: (selectedSeats: Seat[]) => void;
}

export function HallLayout({ showID , onSeatSelect }: HallLayoutProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.BACKEND_URL}/shows/${showID}/seats`
        );
        const data = await response.json();
        console.log(data);
        setSeats(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
  
    fetchSeats();
  }, [showID]);

  const rows = seats.length
    ? Math.max(...seats.map((seat) => seat.row_number))
    : 0;
  const seatsPerRow = seats.length
    ? Math.max(...seats.map((seat) => seat.seat_number))
    : 0;

  const isAdjacent = (seat: Seat) => {
    if (selectedSeats.length === 0) return true;

    return selectedSeats.some((selectedSeat) => {
      return (
        selectedSeat.row_number === seat.row_number &&
        Math.abs(selectedSeat.seat_number - seat.seat_number) === 1
      );
    });
  };

  const isSelectable = (seat: Seat) => {
    if (seat.seat_status === 'BOOKED' || seat.seat_status === 'RESERVED') return false;
    if (selectedSeats.length === 0) return true;
    return isAdjacent(seat);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.seat_status === 'BOOKED') return;

    if (seat.seat_status === 'RESERVED') {
      setCurrentSeat(seat);
      setShowPopup(true);
      return;
    }

    const isCurrentlySelected = selectedSeats.find((s) => s.id === seat.id);

    if (isCurrentlySelected) {
      const index = selectedSeats.findIndex((s) => s.id === seat.id);

      if (index === 0) {
        const newSelection = selectedSeats.filter((s) => s.id !== seat.id);
        setSelectedSeats(newSelection);
        onSeatSelect(newSelection);
      } else if (index === selectedSeats.length - 1) {
        const newSelection = selectedSeats.filter((s) => s.id !== seat.id);
        setSelectedSeats(newSelection);
        onSeatSelect(newSelection);
      } else {
        const newSelection = selectedSeats.slice(0, index);
        setSelectedSeats(newSelection);
        onSeatSelect(newSelection);
      }
    } else {
      if (isAdjacent(seat)) {
        const newSelection = [...selectedSeats, seat].sort((a, b) =>
          a.row_number === b.row_number
            ? a.seat_number - b.seat_number
            : a.row_number - b.row_number
        );
        setSelectedSeats(newSelection);
        onSeatSelect(newSelection);
      }
    }
  };

  const isSeatSelected = (seatId: number) => {
    return selectedSeats.some((s) => s.id === seatId);
  };

  const handlePopupConfirm = async () => {
    if (!currentSeat) return;

    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/seats/${currentSeat.id}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ seat_status: 'AVAILABLE' }),
        }
      );

      if (response.ok) {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seat.id === currentSeat.id ? { ...seat, seat_status: 'AVAILABLE' } : seat
          )
        );
      }
    } catch (err) {
      console.error("Failed to update seat status", err);
    } finally {
      setShowPopup(false);
      setCurrentSeat(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="relative mb-6">
          <div className="w-full h-6 bg-red-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">LEINWAND</span>
          </div>
        </div>

        <div className="">
          <div className="flex flex-row justify-between">
            {Array.from({ length: seatsPerRow }).map((_, i) => (
              <span
                key={i}
                className="text-xs text-neutral-500 w-8 flex items-center justify-center"
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-between pr-2 py-1">
            {Array.from({ length: rows }).map((_, i) => (
              <span
                key={i}
                className="flex text-xs text-neutral-500 h-8 items-center justify-center"
              >
                {i + 1}
              </span>
            ))}
          </div>

          <div
            className="grid gap-2 flex-1"
            style={{
              gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))`,
            }}
          >
            {rows * seatsPerRow > 0 &&
              Array.from({ length: rows * seatsPerRow }).map((_, index) => {
                const row = Math.floor(index / seatsPerRow) + 1;
                const seatNum = (index % seatsPerRow) + 1;
                const seat = seats.find(
                  (s) => s.row_number === row && s.seat_number === seatNum
                );

                if (!seat || seat.seat_type === "NONE") {
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded-md opacity-10"
                    />
                  );
                }

                const isSelected = isSeatSelected(seat.id);
                const canBeSelected = isSelectable(seat);

                return (
                  <div
                    key={index}
                    onClick={() => handleSeatClick(seat)}
                    className={`
                    aspect-square rounded-md flex items-center justify-center cursor-pointer
                    transition-all duration-200
                    ${seat.seat_type === "STANDARD" ? "bg-emerald-600" : ""}
                    ${seat.seat_type === "PREMIUM" ? "bg-blue-600" : ""}
                    ${seat.seat_type === "VIP" ? "bg-purple-600" : ""}
                    ${seat.seat_status === "BOOKED" || seat.seat_status === "RESERVED" ? "bg-gray-400 cursor-not-allowed" : ""}
                    ${isSelected ? "ring-2 ring-red-500 ring-offset-2" : ""}
                    ${!isSelected && canBeSelected ? "opacity-100" : ""}
                    ${
                      !isSelected && !canBeSelected
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                    title={`Reihe ${row}, Sitz ${seatNum} (${seat.seat_type})${
                      !canBeSelected ? " - Nicht auswählbar" : ""
                    }`}
                  >
                    {seat.seat_type === "STANDARD" && (
                      <Square size={12} className="text-white" />
                    )}
                    {seat.seat_type === "PREMIUM" && (
                      <Armchair size={14} className="text-white" />
                    )}
                    {seat.seat_type === "VIP" && (
                      <Crown size={14} className="text-white" />
                    )}
                    {showPopup && currentSeat?.id === seat.id && (
                      <div>
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg z-20">
                          <h3 className="text-lg font-medium text-gray-800">
                            Sitz {currentSeat.row_number}, {currentSeat.seat_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Dieser Sitz ist reserviert. Möchten Sie die Reservierung aufheben?
                          </p>
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={handlePopupConfirm}
                              className="px-4 py-2 bg-red-600 text-white rounded-md"
                            >
                              Ja, aufheben
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex gap-6 justify-center mt-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Square size={12} className="text-white" />
            </div>
            <span className="text-gray-400">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Armchair size={14} className="text-white" />
            </div>
            <span className="text-gray-400">Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <Crown size={14} className="text-white" />
            </div>
            <span className="text-gray-400">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
              <Ban size={14} className="text-white line-through" />
            </div>
            <span className="text-gray-400">Nicht Verfügbar</span>
          </div>
        </div>

        {/* Ausgewählte Sitze */}
        {selectedSeats.length > -1 && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">
              Ausgewählte Sitze:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats
                .sort((a, b) =>
                  a.row_number === b.row_number
                    ? a.seat_number - b.seat_number
                    : a.row_number - b.row_number
                )
                .map((seat) => (
                  <div key={seat.id} className="flex items-center">
                    <div className="px-2 py-1 bg-white rounded border border-gray-200 text-sm"></div>
                    <div>
                      Reihe {seat.row_number}, Sitz {seat.seat_number}
                      {seat.seat_type === "PREMIUM" && " (Premium)"}
                      {seat.seat_type === "VIP" && " (VIP)"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
