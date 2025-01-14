'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Show, Movie } from "@/types/index"

import Header from "@/components/movie-booking/header"
import DatePicker from "@/components/movie-booking/date-picker"
import TimePicker from "@/components/movie-booking/time-picker"
import SeatSelector from "@/components/movie-booking/seat-selector"
import MovieInfo from "@/components/movie-booking/movie-info"


export default function MovieDetail() {
  const params = useParams()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        // Lade Film-Details
        const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${params.id}`)
        if (!movieResponse.ok) throw new Error('Film nicht gefunden')
        const movieData = await movieResponse.json()
        setMovie(movieData)

        // Lade Shows für diesen Film
        const showsResponse = await fetch(`${process.env.BACKEND_URL}/movies/${params.id}/shows`)
        if (!showsResponse.ok) throw new Error('Keine Vorstellungen gefunden')
        const showsData = await showsResponse.json()
        console.log(showsData)
        setShows(showsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieAndShows()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-7xl w-[85%] mx-auto">
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    )
  }

  // if (error || !movie) {
  //   return (
  //     <div className="min-h-screen bg-[#141414] p-8">
  //       <div className="max-w-7xl w-[85%] mx-auto">
  //         <p className="text-red-500">{error || 'Film nicht gefunden'}</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-[#141414] p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {movie && (
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
          )}
          <div className="flex-1">
            {/*<DatePicker />
            <TimePicker />
            <SeatSelector />*/}
            {shows.map(show => (
              <Card key={show.id} className="mb-4">
                <CardContent>
                  <h2 className="text-xl font-semibold">{show.hall_id}</h2>
                  <p>{show.movie_id}</p>
                  <p>{show.start_time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  )
} 