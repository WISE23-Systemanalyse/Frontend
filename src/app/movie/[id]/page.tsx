"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Show, Movie, Seat } from "@/types/index";
import DatePicker from "@/components/movie-booking/date-picker";
import TimePicker from "@/components/movie-booking/time-picker";
import MovieInfo from "@/components/movie-booking/movie-info";
import { HallLayout } from "@/components/hall/HallLayout";
import { Card, CardContent } from "@/components/ui/card";
import assert from "assert";

export default function MovieDetail() {
  const params = useParams();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("de-DE", { month: "long" })
  );
  const [selectedShowId, setSelectedShowId] = useState<number | undefined>(0);
  const [selectedHallId, setSelectedHallId] = useState<number>(2);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Event handlers
  const handleShowSelect = (showId: number, hallId: number) => {
    console.log(showId, hallId);
    setSelectedShowId(showId);
    setSelectedHallId(hallId);
  };
  const handleCheckout = async () => {
   try {
    selectedSeats.forEach(async (seat) => {
      const response = await fetch(`${process.env.BACKEND_URL}/seats/${seat.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seat_id: seat.id,
          show_id: selectedShowId,
        }),
      });
      if (response.status === 400) assert.fail('Sitzplatz bereits reserviert');
      if (!response.ok) throw new Error('Fehler beim Buchen');
    });
   } catch (err) {
    setError(
      err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
    );
   }
  };

  // Data fetching
  React.useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setIsLoading(true);
        const movieResponse = await fetch(
          `${process.env.BACKEND_URL}/movies/${params.id}`
        );
        if (!movieResponse.ok) throw new Error("Film nicht gefunden");
        const movieData = await movieResponse.json();
        setMovie(movieData);

        const showsResponse = await fetch(
          `${process.env.BACKEND_URL}/movies/${params.id}/shows`
        );
        if (!showsResponse.ok) throw new Error("Keine Vorstellungen gefunden");
        const showsData = await showsResponse.json();
        setShows(showsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [params.id]);

  React.useEffect(() => {
    setSelectedShowId(undefined);
  }, [selectedDate, selectedMonth]);

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
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Movie Information Section */}
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <MovieInfo
                  id={movie.id}
                  title={movie.title}
                  description={movie.description}
                  rating={movie.rating}
                  genres={movie.genres}
                  duration={movie.duration}
                  imageUrl={movie.imageUrl}
                  year={movie.year}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                {/* Booking Section */}
                <div className="space-y-6">
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Vorstellung wählen
                    </h2>
                    <DatePicker
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                    />
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Verfügbare Zeiten
                    </h2>
                    <TimePicker
                      shows={shows}
                      selectedDate={selectedDate}
                      selectedMonth={selectedMonth}
                      onShowSelect={handleShowSelect}
                      selectedShowId={selectedShowId}
                    />
                  </div>
                </div>

                {/* Seat Selection */}
                {selectedShowId && (
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Sitzplatz wählen
                    </h2>
                    <HallLayout
                      hallID={selectedHallId}
                      onSeatSelect={(seats) => setSelectedSeats(seats)}
                    />
                  </div>
                )}

                {/* Checkout Button */}
                <div className="flex justify-center">
                  <button
                    onClick={()=>handleCheckout()}
                    className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors ${
                      selectedSeats.length < 1 ? "opacity-20" : ""
                    }`}
                    disabled={selectedSeats.length < 1 ? true : false}
                  >
                    Buchen
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}