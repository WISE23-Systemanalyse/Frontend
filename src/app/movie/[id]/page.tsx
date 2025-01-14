'use client'

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Show, Movie } from "@/types/index"
import { TimeSlot } from "@/types/index"

import DatePicker from "@/components/movie-booking/date-picker"
import TimePicker from "@/components/movie-booking/time-picker"
import MovieInfo from "@/components/movie-booking/movie-info"
import HallLayout from '@/components/hall/HallLayout'

type SeatData = {
  id: number;
  row_number: number;
  seat_number: number;
  seat_type: 'Standard' | 'Premium' | 'VIP';
};

export default function MovieDetail() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('de-DE', { month: 'long' }))
  const [selectedShowId, setSelectedShowId] = useState<number | undefined>()
  const [selectedHallId, setSelectedHallId] = useState<number>(5) // Default hall ID is 5
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([])

  // Handle show and hall selection
  const handleShowSelect = (showId: number, hallId: number) => {
    setSelectedShowId(showId)
    setSelectedHallId(hallId)
  }

  // Handle checkout
  const handleCheckout = () => {
    if (selectedShowId) {
      router.push(`/checkout/${selectedShowId}`)
    }
  }

  React.useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${params.id}`)
        if (!movieResponse.ok) throw new Error('Film nicht gefunden')
        const movieData = await movieResponse.json()
        setMovie(movieData)

        const showsResponse = await fetch(`${process.env.BACKEND_URL}/movies/${params.id}/shows`)
        if (!showsResponse.ok) throw new Error('Keine Vorstellungen gefunden')
        const showsData = await showsResponse.json()
        setShows(showsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieAndShows()
  }, [params.id])

  // Reset only show selection when date changes, keep hall visible
  React.useEffect(() => {
    setSelectedShowId(undefined)
  }, [selectedDate, selectedMonth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-7xl w-[85%] mx-auto">
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-7xl w-[85%] mx-auto">
          <p className="text-red-500">{error || 'Film nicht gefunden'}</p>
        </div>
      </div>
    )
  }

  const selectedShow = shows.find(show => show.id === selectedShowId)
  const showDateTime = selectedShow ? new Date(selectedShow.start_time) : null

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="flex flex-col lg:flex-row gap-8">
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
        <div className="flex-1">
          <DatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
          <TimePicker
            shows={shows}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            onShowSelect={handleShowSelect}
            selectedShowId={selectedShowId}
          />
          <div className="mt-6">
            <HallLayout 
              hallId={selectedHallId} 
              onSeatSelect={(seats) => setSelectedSeats(seats)}
            />
            {selectedShowId && (
              <div className="mt-6">
                <div className="bg-neutral-800 p-4 rounded-lg mb-4">
                  <h3 className="text-white font-semibold mb-2">Ausgewählte Vorstellung:</h3>
                  <p className="text-neutral-300">
                    {showDateTime?.toLocaleString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-neutral-300">Saal {selectedHallId}</p>
                  <p className="text-neutral-300">Ausgewählte Sitze: {selectedSeats.length}</p>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedSeats.length === 0}
                >
                  Zur Kasse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

