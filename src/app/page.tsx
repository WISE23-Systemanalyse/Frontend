'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

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

interface MoviesByGenre {
  [key: string]: Movie[]
}

export default function Home() {
  const [moviesByGenre, setMoviesByGenre] = useState<MoviesByGenre>({})
  const [filteredMoviesByGenre, setFilteredMoviesByGenre] = useState<MoviesByGenre>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'none' | 'rating' | 'year'>('none')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/movies`)
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Filme')
        }
        const movies: Movie[] = await response.json()
        
        // Gruppiere Filme nach Genres
        const grouped = movies.reduce((acc: MoviesByGenre, movie) => {
          // Wenn keine Genres vorhanden sind, füge den Film unter "Andere" ein
          if (!movie.genres || movie.genres.length === 0) {
            if (!acc["Andere"]) {
              acc["Andere"] = []
            }
            acc["Andere"].push(movie)
            return acc
          }
          
          // Ansonsten nach Genres gruppieren
          movie.genres.forEach(genre => {
            if (!acc[genre]) {
              acc[genre] = []
            }
            acc[genre].push(movie)
          })
          return acc
        }, {})

        setMoviesByGenre(grouped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Neue Filterfunktion
  useEffect(() => {
    const filterAndSortMovies = () => {
      const searchTerm = searchQuery.toLowerCase()
      
      const filtered = Object.entries(moviesByGenre).reduce((acc: MoviesByGenre, [genre, movies]) => {
        let filteredMovies = movies.filter(movie => {
          return (
            movie.title.toLowerCase().includes(searchTerm) ||
            searchTerm === movie.year.toString()
          )
        })

        // Sortiere die Filme nach dem ausgewählten Kriterium
        if (sortBy !== 'none') {
          filteredMovies = [...filteredMovies].sort((a, b) => {
            if (sortBy === 'rating') {
              return sortDirection === 'desc' ? b.rating - a.rating : a.rating - b.rating
            } else if (sortBy === 'year') {
              return sortDirection === 'desc' ? b.year - a.year : a.year - b.year
            }
            return 0
          })
        }
        
        if (filteredMovies.length > 0) {
          acc[genre] = filteredMovies
        }
        return acc
      }, {})
      
      setFilteredMoviesByGenre(filtered)
    }

    filterAndSortMovies()
  }, [moviesByGenre, searchQuery, sortBy, sortDirection, setFilteredMoviesByGenre])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-7xl w-[85%] mx-auto">
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-7xl w-[85%] mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="max-w-7xl w-[85%] mx-auto">
        {/* Filter Section */}
        <div className="mb-8 flex gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche nach Titel oder Jahr..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#2C2C2C] text-white border-0 focus:ring-0 focus:ring-red-600/50 placeholder:text-gray-400 pl-10 hover:bg-[#3C3C3C]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: 'none' | 'rating' | 'year') => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] bg-[#2C2C2C] text-white border-0 hover:bg-[#3C3C3C] focus:ring-red-600/50">
                <SelectValue placeholder="Sortieren nach..." />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] text-white border-gray-700 hover:cursor-pointer">
                <SelectItem value="none" className="hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white">Standard</SelectItem>
                <SelectItem value="rating" className="hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white">Bewertung</SelectItem>
                <SelectItem value="year" className="hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white">Erscheinungsjahr</SelectItem>
              </SelectContent>
            </Select>
            {sortBy !== 'none' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="bg-[#2C2C2C] text-white hover:bg-red-500 hover:text-white focus:ring-red-600/50"
              >
                <ArrowUpDown className={`h-4 w-4 transition-transform ${
                  sortDirection === 'asc' ? 'rotate-180' : ''
                }`} />
              </Button>
            )}
          </div>
        </div>

        {/* Movies Grid */}
        {Object.keys(filteredMoviesByGenre).length === 0 ? (
          <p className="text-white text-center">Keine Filme gefunden</p>
        ) : (
          Object.entries(filteredMoviesByGenre).map(([genre, movies]) => (
            <div key={genre} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">{genre}</h2>
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <Link href={`/movie/${movie.id}`} key={movie.id}>
                      <Card className="bg-[#2C2C2C] border-0 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer hover:ring-2 hover:ring-red-600">
                        <div className="aspect-[2/3] relative">
                          <img
                            src={movie.imageUrl}
                            alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 min-h-[3.5rem]" title={movie.title}>{movie.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">{movie.year}</p>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center">
                              <span className="mr-1">⭐</span>
                              <span>{movie.rating.toFixed(1)}</span>
                            </div>
                            <span>{movie.duration || '-'} Min.</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
