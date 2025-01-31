'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Star, Clock, ChevronRight } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

interface Movie {
  id: number
  title: string
  year: number
  description: string
  rating: number
  imageUrl: string
  genres: string[]
  duration: number
}

interface FilterState {
  search: string
  genres: string[]
  rating: number
  year: {
    from: number
    to: number
  }
  duration: {
    from: number
    to: number
  }
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genres: [],
    rating: 0,
    year: {
      from: 1900,
      to: new Date().getFullYear()
    },
    duration: {
      from: 0,
      to: 300
    }
  })

  // Extrahiere alle verfügbaren Filter-Optionen
  const allGenres = Array.from(new Set(movies.flatMap(movie => movie.genres))).sort()

  // Filter und Sortier-Logik
  useEffect(() => {
    let result = [...movies]

    // Erweiterte Suche (Titel, Jahr oder Genre)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.year.toString().includes(searchTerm) ||
        movie.genres.some(genre => 
          genre.toLowerCase().includes(searchTerm)
        )
      )
    }

    // Genre Filter
    if (filters.genres.length > 0) {
      result = result.filter(movie =>
        filters.genres.every(genre => movie.genres.includes(genre))
      )
    }

    // Rating Filter
    if (filters.rating > 0) {
      result = result.filter(movie => movie.rating >= filters.rating)
    }

    // Jahr Filter
    result = result.filter(movie =>
      movie.year >= filters.year.from &&
      movie.year <= filters.year.to
    )

    // Dauer Filter
    result = result.filter(movie =>
      movie.duration >= filters.duration.from &&
      movie.duration <= filters.duration.to
    )

    // Sortierung
    result.sort((a, b) => {
      const aValue = a.title
      const bValue = b.title
      
      return aValue.localeCompare(bValue)
    })

    setFilteredMovies(result)
  }, [movies, filters])

  // Gruppiere Filme nach Genre
  const moviesByGenre = allGenres.reduce((acc, genre) => {
    acc[genre] = filteredMovies.filter(movie => 
      movie.genres.includes(genre)
    )
    return acc
  }, {} as Record<string, Movie[]>)

  // Sortiere Genres nach Anzahl der Filme
  const sortedGenreEntries = Object.entries(moviesByGenre)
    .sort(([, moviesA], [, moviesB]) => moviesB.length - moviesA.length)
    .filter(([, movies]) => movies.length > 0)

  // Modifiziere den fetchMovies useEffect
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/movies`)
        if (!response.ok) throw new Error('Fehler beim Laden der Filme')
        const data = await response.json()
        setMovies(data)
        setFilteredMovies(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (isLoading) return <div className="min-h-screen bg-[#141414] p-8 text-white">Lädt...</div>
  if (error) return <div className="min-h-screen bg-[#141414] p-8 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header-Bereich mit Suche */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche nach Titel, Jahr oder Genre..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 bg-[#2C2C2C]/80 text-white border-0 focus:ring-1 focus:ring-red-600 h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Movies Display - Immer nach Genre sortiert */}
        <div className="space-y-12">
          {sortedGenreEntries.map(([genre, movies]) => (
            <div key={genre} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {genre}
                </h2>
                <div className="text-sm text-gray-400 font-medium">
                  {movies.length} {movies.length === 1 ? 'Film' : 'Filme'}
                </div>
                <div className="flex-1 border-b border-gray-800" />
              </div>
              <div className="relative">
                <div 
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                  id={`scroll-${genre}`}
                >
                  {movies.map(movie => (
                    <div key={movie.id} className="flex-none w-[250px] first:ml-1">
                      <MovieCard 
                        movie={movie} 
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Scroll-Button nur anzeigen, wenn es mehr Inhalt zum Scrollen gibt */}
                {movies.length > 4 && (
                  <div 
                    id={`scroll-indicator-${genre}`}
                    className="absolute -right-4 top-0 bottom-4 flex items-center justify-end 
                              bg-gradient-to-l from-[#141414] via-[#141414]/95 to-transparent w-24"
                  >
                    <button
                      onClick={() => {
                        const container = document.getElementById(`scroll-${genre}`)
                        if (container) {
                          container.scrollBy({
                            left: container.clientWidth - 100,
                            behavior: 'smooth'
                          })
                        }
                      }}
                      className="flex items-center justify-center mr-4"
                      aria-label="Weitere Filme anzeigen"
                    >
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full 
                                    hover:bg-white/20 transform hover:scale-110 transition-all duration-300
                                    border border-white/20">
                        <ChevronRight className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            Keine Filme gefunden
          </div>
        )}
      </div>
    </div>
  )
}

// Neue MovieCard-Komponente mit Portal
const MovieCard = ({ movie, className }: { movie: Movie; className?: string }) => (
  <div className="relative group">
    <Link href={`/movie/${movie.id}`}>
      <Card className={`
        bg-[#2C2C2C] border-0 overflow-hidden 
        cursor-pointer rounded-xl w-full
        transition-all duration-500
        ${className || ''}
      `}>
        {/* Bild-Container mit exaktem 500x750 Verhältnis (2:3) */}
        <div className="relative pt-[150%] bg-[#1C1C1C] overflow-hidden">
          <Image
            src={movie.imageUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTAwIDc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzFjMWMxYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2VpbiBCaWxkIHZlcmbDvGdiYXI8L3RleHQ+PC9zdmc+';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-transparent to-transparent 
                        opacity-90 transition-opacity duration-500
                        group-hover:opacity-50" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Titel */}
          <h3 className="text-base font-bold text-white mb-2 truncate">
            {movie.title}
          </h3>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3 overflow-hidden max-h-[22px]">
            {movie.genres.slice(0, 3).map(genre => (
              <span
                key={genre}
                className="text-xs px-1.5 py-0.5 rounded-full
                         bg-[#3C3C3C] text-gray-200
                         whitespace-nowrap"
              >
                {genre}
              </span>
            ))}
            {movie.genres.length > 3 && (
              <span className="text-xs text-gray-400">
                +{movie.genres.length - 3}
              </span>
            )}
          </div>
          
          {/* Meta-Informationen */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{movie.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>{movie.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{movie.duration}m</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  </div>
)
