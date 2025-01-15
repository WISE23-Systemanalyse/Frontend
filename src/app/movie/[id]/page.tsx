/* eslint-disable @next/next/no-img-element */
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"

interface Movie {
  id: number
  title: string
  year: number
  description: string
  rating: number
  imageUrl: string
}

interface Show {
  id: number
  movieId: number
  date: string
  time: string
  hall: string
  price: number
}

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
        const movieResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/movies/${params.id}`)
        if (!movieResponse.ok) throw new Error('Film nicht gefunden')
        const movieData = await movieResponse.json()
        setMovie(movieData)

        // Lade Shows für diesen Film
        const showsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/movies/${params.id}/shows`)
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

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="max-w-7xl w-[85%] mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Film-Details */}
          <div className="md:w-1/3">
            <Card className="bg-[#2C2C2C] border-0 overflow-hidden">
              <div className="aspect-[2/3] relative">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
            <p className="text-gray-400 mb-4">{movie.year}</p>
            <div className="flex items-center text-gray-400 mb-6">
              <span className="mr-1">⭐</span>
              <span>{movie.rating.toFixed(1)}</span>
            </div>
            <p className="text-white mb-8">{movie.description}</p>

            {/* Vorstellungen */}
            <h2 className="text-2xl font-bold text-white mb-4">Vorstellungen</h2>
            {shows.length === 0 ? (
              <p className="text-gray-400">Keine Vorstellungen verfügbar</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shows.map((show) => (
                  <Card key={show.id} className="bg-[#3C3C3C] border-0 p-4">
                    <CardContent className="text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{new Date(show.date).toLocaleDateString()}</p>
                          <p>{show.time} Uhr</p>
                          <p className="text-gray-400">Saal {show.hall}</p>
                        </div>
                        <div className="text-xl font-bold">
                          {show.price.toFixed(2)}€
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 