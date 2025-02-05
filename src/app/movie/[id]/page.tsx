"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Show, Movie, Seat } from "@/types/index";
import DatePicker from "@/components/movie-booking/date-picker";
import TimePicker from "@/components/movie-booking/time-picker";
import MovieInfo from "@/components/movie-booking/movie-info";
import { HallLayout } from "@/components/hall/HallLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

interface ShowGroups {
  [key: string]: Show[];
}

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showId = searchParams.get("showId");
  const dateParam = searchParams.get("date");
  const monthParam = searchParams.get("month");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    dateParam ? parseInt(dateParam, 10) : new Date().getDate()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    monthParam || new Date().toLocaleString("de-DE", { month: "long" })
  );
  const [selectedShowId, setSelectedShowId] = useState<number | undefined>();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showGroups, setShowGroups] = useState<ShowGroups>({});
  const [showHallLayout, setShowHallLayout] = useState(false);
  const [show, setShow] = useState<Show | null>(null);

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [movieResponse, showsResponse] = await Promise.all([
          fetch(`${process.env.BACKEND_URL}/movies/${params.id}`),
          fetch(`${process.env.BACKEND_URL}/movies/${params.id}/shows`)
        ]);

        if (!movieResponse.ok) throw new Error("Film nicht gefunden");
        if (!showsResponse.ok) throw new Error("Vorstellungen nicht gefunden");

        const [movieData, showsData] = await Promise.all([
          movieResponse.json(),
          showsResponse.json()
        ]);

        setMovie(movieData);

        // Gruppiere Shows nach Tagen
        const currentTime = new Date();
        const futureShows = showsData.filter((show: Show) => 
          new Date(show.start_time) > currentTime
        );

        const grouped = futureShows.reduce((acc: ShowGroups, show: Show) => {
          const showDate = new Date(show.start_time);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const dateKey = showDate.toDateString() === today.toDateString()
            ? 'Heute'
            : showDate.toDateString() === tomorrow.toDateString()
              ? 'Morgen'
              : showDate.toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
          
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(show);
          return acc;
        }, {});

        // Sortiere Shows nach Startzeit
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        });

        setShows(showsData);
        setShowGroups(grouped);

        // Wenn showId vorhanden ist, lade die vollständigen Show-Details
        if (showId) {
          const response = await fetch(`${process.env.BACKEND_URL}/shows/${showId}`);
          if (!response.ok) throw new Error("Show nicht gefunden");
          
          const showDetails = await response.json();
          console.log("Show Details:", showDetails);
          setShow(showDetails);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [params.id, showId]);

  // Hilfsfunktion für die Formatierung der Zeit
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  // Memoize die Callbacks
  const handleShowSelect = async (show: Show) => {
    console.log("Selected Show:", show);
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/shows/${show.show_id}`);
      if (!response.ok) throw new Error("Show nicht gefunden");
      const showDetails = await response.json();
      console.log("Show Details:", showDetails);
      setShow(showDetails);
      setShowHallLayout(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    }
  };

  const handleSeatSelection = useCallback((seats: Seat[]) => {
    setSelectedSeats(seats);
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!selectedShowId || selectedSeats.length === 0) return;

    try {
      setError(null);
      const reservationPromises = selectedSeats.map(seat => 
        fetch(`${process.env.BACKEND_URL}/seats/${seat.id}/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seat_id: seat.id,
            show_id: selectedShowId,
          }),
        })
      );

      const responses = await Promise.all(reservationPromises);
      
      if (responses.some(r => r.status === 400)) {
        throw new Error('Sitzplatz bereits reserviert');
      }
      if (responses.some(r => !r.ok)) {
        throw new Error('Fehler beim Buchen');
      }

      router.push(`/checkout?seats=${selectedSeats.map(seat => seat.id).join(',')}&showId=${selectedShowId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    }
  }, [selectedShowId, selectedSeats, router]);

  // Zurück zur Vorstellungsauswahl
  const handleBack = () => {
    setShowHallLayout(false);
    setSelectedShowId(undefined);
    setSelectedSeats([]);
  };

  React.useEffect(() => {
    setSelectedShowId(undefined);
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showId = params.get('showId');
    
    if (params.get('showSeats') === 'true' && showId) {
      setSelectedShowId(parseInt(showId, 10));  // String zu Number konvertieren
      setShowSeatSelection(true);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-800 rounded"></div>
                <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-neutral-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
            <p className="text-red-500">{error || "Film nicht gefunden"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header mit Zurück-Button und Titel */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#2C2C2C] hover:bg-red-600/20 
                       flex items-center justify-center transition-all duration-200 group"
            aria-label="Zurück"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {movie.title}
          </h1>
        </div>

        {/* Content Card */}
        <Card className="bg-[#2C2C2C] border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <MovieInfo {...movie} />
              </div>

              <div className="lg:col-span-2 space-y-8">
                {!showHallLayout ? (
                  // Vorstellungsauswahl
                  <div className="space-y-6">
                    {Object.entries(showGroups)
                      .sort(([dateA], [dateB]) => {
                        if (dateA === 'Heute') return -1;
                        if (dateB === 'Heute') return 1;
                        if (dateA === 'Morgen') return -1;
                        if (dateB === 'Morgen') return 1;
                        return 0;
                      })
                      .map(([date, dayShows]) => (
                        <div key={date} className="bg-[#1C1C1C] rounded-xl p-6 shadow-md">
                          <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white">{date}</h2>
                            <div className="text-gray-400 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              {dayShows.length} {dayShows.length === 1 ? 'Vorstellung' : 'Vorstellungen'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {dayShows.map((show) => (
                              <button
                                key={show.show_id}
                                onClick={() => handleShowSelect(show)}
                                className={`
                                  p-4 rounded-lg text-center transition-all duration-200
                                  ${selectedShowId === show.show_id 
                                    ? 'bg-red-600 text-white scale-105' 
                                    : 'bg-[#2C2C2C] hover:bg-red-600/20 text-gray-300 hover:text-white hover:scale-105'}
                                `}
                              >
                                <div className="text-lg font-semibold">
                                  {formatTime(show.start_time)}
                                </div>
                                <div className="text-sm mt-1 opacity-80">
                                  Saal {show.hall_name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  // Saalansicht
                  <div className="space-y-8">
                    <div className="bg-[#1C1C1C] rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer group" onClick={handleBack}>
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>Zurück zur Vorstellungsauswahl</span>
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-4">
                        Sitzplatz wählen
                      </h2>
                      <HallLayout
                        show={show!}
                        onSeatSelectAction={handleSeatSelection}
                      />
                    </div>

                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleCheckout}
                        disabled={selectedSeats.length === 0}
                        className={`
                          px-8 py-3 rounded-lg text-lg font-medium
                          transition-all duration-200 transform
                          ${selectedSeats.length === 0 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}
                        `}
                      >
                        {selectedSeats.length > 0 
                          ? `${selectedSeats.length} ${selectedSeats.length === 1 ? 'Platz' : 'Plätze'} buchen` 
                          : 'Bitte Plätze auswählen'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}