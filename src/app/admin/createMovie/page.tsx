/* eslint-disable @next/next/no-img-element */
'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Toast } from "@/components/ui/toast"

interface Movie {
  title: string
  description: string
  duration: number
  releaseDate: string
  image_url: string
  rating: number
  genres: string[]
}

interface SearchResult {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  runtime: number
  poster_path: string
  backdrop_path: string
  vote_average: number
  genres: { id: number; name: string }[]
  director: string
  cast: string[]
  production_countries: { iso_3166_1: string; name: string }[]
}

interface TMDBSearchResult {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  runtime: number
  poster_path: string
  backdrop_path: string
  vote_average: number
  genre_ids: number[]
}

const API_BASE_URL = process.env.BACKEND_URL

const GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
}

export default function CreateMovie() {
  const router = useRouter()
  const [movie, setMovie] = useState<Movie>({
    title: '',
    description: '',
    duration: 0,
    releaseDate: '',
    image_url: '',
    rating: 0,
    genres: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  })

  const searchMovies = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const searchResponse = await fetch(
        `${API_BASE_URL}/movies/tmdb/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      )
      
      if (!searchResponse.ok) {
        throw new Error('Fehler bei der Filmsuche')
      }

      const searchResults = await searchResponse.json()
      console.log('Suchergebnisse:', searchResults)

      if (!searchResults?.length) {
        setError('Keine Filme gefunden')
        setSearchResults([])
        return
      }

      const mappedResults = searchResults.map((movie: TMDBSearchResult) => ({
        id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        overview: movie.overview,
        release_date: movie.release_date,
        runtime: movie.runtime,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        genres: movie.genre_ids.map(id => ({ id, name: '' })),
        director: '',
        cast: [],
        production_countries: []
      }))

      console.log('Verarbeitete Ergebnisse:', mappedResults)
      setSearchResults(mappedResults)
    } catch (err) {
      console.error('Suchfehler:', err)
      setError('Fehler bei der Filmsuche')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const selectMovie = (result: SearchResult) => {
    const genres = result.genres
      .map(genre => GENRE_MAP[genre.id])
      .filter(name => name !== undefined)

    setMovie({
      title: result.title,
      description: result.overview,
      duration: result.runtime || 0,
      releaseDate: result.release_date,
      image_url: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : '',
      rating: Number(result.vote_average.toFixed(1)),
      genres: genres
    })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movie) return

    try {
      setToast({
        message: 'Film wird gespeichert...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movie.title,
          year: new Date(movie.releaseDate).getFullYear(),
          description: movie.description,
          rating: movie.rating,
          imageUrl: movie.image_url,
          genres: movie.genres,
          duration: movie.duration
        })
      })

      if (!response.ok) throw new Error('Film konnte nicht erstellt werden')
      
      setToast({
        message: 'Film wurde erfolgreich erstellt!',
        variant: 'success',
        isVisible: true
      })

      setTimeout(() => {
        router.push('/admin/movies')
      }, 500)
      
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Film konnte nicht erstellt werden',
        variant: 'error',
        isVisible: true
      })
      console.error(err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchMovies()
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-red-500 transition-colors"
              onClick={() => router.push('/admin/movies')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Neuen Film anlegen</h1>
          </div>
        </div>

        <div className="flex gap-6">
          <Card className="flex-1 bg-[#2C2C2C] border-0">
            <CardHeader>
              <CardTitle className="text-white">Filminformationen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Filmtitel"
                    value={movie.title}
                    onChange={(e) => setMovie({...movie, title: e.target.value})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Beschreibung"
                    value={movie.description}
                    onChange={(e) => setMovie({...movie, description: e.target.value})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Dauer (in Minuten)"
                    value={movie.duration || ''}
                    onChange={(e) => setMovie({...movie, duration: parseInt(e.target.value) || 0})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={movie.releaseDate}
                    onChange={(e) => setMovie({...movie, releaseDate: e.target.value})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Bild-URL"
                    value={movie.image_url}
                    onChange={(e) => setMovie({...movie, image_url: e.target.value})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Bewertung (0-10)"
                    value={movie.rating}
                    onChange={(e) => setMovie({...movie, rating: parseFloat(e.target.value)})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre, index) => (
                      <div 
                        key={index}
                        className="flex items-center bg-[#3C3C3C] px-3 py-1 rounded-full"
                      >
                        <span className="text-white">{genre}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newGenres = movie.genres.filter((_, i) => i !== index)
                            setMovie({...movie, genres: newGenres})
                          }}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Genre hinzufügen"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget as HTMLInputElement
                          const newGenre = input.value.trim()
                          if (newGenre && !movie.genres.includes(newGenre)) {
                            setMovie({
                              ...movie,
                              genres: [...movie.genres, newGenre]
                            })
                            input.value = ''
                          }
                        }
                      }}
                      className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Genre hinzufügen"]') as HTMLInputElement
                        const newGenre = input.value.trim()
                        if (newGenre && !movie.genres.includes(newGenre)) {
                          setMovie({
                            ...movie,
                            genres: [...movie.genres, newGenre]
                          })
                          input.value = ''
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                  {isLoading ? 'Wird gespeichert...' : 'Film anlegen'}
                </Button>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </CardContent>
          </Card>

          <Card className="w-[350px] bg-[#2C2C2C] border-0">
            <CardHeader>
              <CardTitle className="text-white">Film suchen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Film suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                  <Button 
                    onClick={searchMovies} 
                    disabled={isLoading || !searchQuery.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? <span>Suche...</span> : <span>Suchen</span>}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto border-0 rounded-md bg-[#3C3C3C]">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        className="p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                        onClick={() => selectMovie(result)}
                      >
                        <div className="flex gap-3">
                          {result.poster_path && (
                            <div className="w-16 min-w-16 h-24 relative">
                              <img 
                                src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                                alt={result.title}
                                className="absolute w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-white">{result.title}</p>
                                {result.original_title !== result.title && (
                                  <p className="text-sm text-gray-400">
                                    ({result.original_title})
                                  </p>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
                                {result.vote_average.toFixed(1)} ⭐
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">
                              {result.release_date?.split('-')[0]}
                              {result.runtime ? ` • ${result.runtime} Min.` : ''}
                            </p>
                            <p className="text-sm text-gray-400">
                              {result.genres.map(g => g.name).join(', ')}
                            </p>
                            {result.director && (
                              <p className="text-sm text-gray-400">
                                Regie: {result.director}
                              </p>
                            )}
                            {result.cast.length > 0 && (
                              <p className="text-sm text-gray-400">
                                Cast: {result.cast.join(', ')}
                              </p>
                            )}
                            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                              {result.overview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 