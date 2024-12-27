'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Movie {
  title: string
  description: string
  duration: number
  releaseDate: string
  image_url: string
  rating: number
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

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function CreateMovie() {
  const [movie, setMovie] = useState<Movie>({
    title: '',
    description: '',
    duration: 0,
    releaseDate: '',
    image_url: '',
    rating: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchMovies = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Neue API-Route verwenden
      const searchResponse = await fetch(
        `${API_BASE_URL}/movies/tmdb/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      )
      
      const searchResults = await searchResponse.json()
      console.log('Suchergebnisse:', searchResults)

      if (!searchResults?.length) {
        setError('Keine Filme gefunden')
        setSearchResults([])
        return
      }

      // Direkt die Ergebnisse setzen, da die Details bereits enthalten sind
      const mappedResults = searchResults.map(movie => ({
        id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        overview: movie.overview,
        release_date: movie.release_date,
        runtime: movie.runtime || 0,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        genres: movie.genre_ids.map(id => ({ id, name: '' })), // Genres werden später angepasst
        director: '', // Optional: Könnte über einen zusätzlichen API-Call geholt werden
        cast: [], // Optional: Könnte über einen zusätzlichen API-Call geholt werden
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
    setMovie({
      title: result.title,
      description: result.overview,
      duration: result.runtime || 0,
      releaseDate: result.release_date,
      image_url: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : '',
      rating: result.vote_average
    })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
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
          imageUrl: movie.image_url
        })
      })

      if (!response.ok) {
        throw new Error('Film konnte nicht erstellt werden')
      }

      setMovie({
        title: '',
        description: '',
        duration: 0,
        releaseDate: '',
        image_url: '',
        rating: 0
      })

      alert('Film wurde erfolgreich gespeichert!')
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchMovies()
    }
  }

  return (
    <div className='flex h-screen w-screen p-4 gap-4'>
      <Card className="w-2/3">
        <CardHeader>
          <CardTitle>Neuen Film anlegen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Filmtitel"
                value={movie.title}
                onChange={(e) => setMovie({...movie, title: e.target.value})}
              />
            </div>
            <div>
              <Textarea
                placeholder="Beschreibung"
                value={movie.description}
                onChange={(e) => setMovie({...movie, description: e.target.value})}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Dauer (in Minuten)"
                value={movie.duration}
                onChange={(e) => setMovie({...movie, duration: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Input
                type="date"
                value={movie.releaseDate}
                onChange={(e) => setMovie({...movie, releaseDate: e.target.value})}
              />
            </div>
            <div>
              <Input
                placeholder="Bild-URL"
                value={movie.image_url}
                onChange={(e) => setMovie({...movie, image_url: e.target.value})}
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
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Wird gespeichert...' : 'Film anlegen'}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>

      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Film suchen</CardTitle>
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
              />
              <Button 
                onClick={searchMovies} 
                disabled={isLoading || !searchQuery.trim()}
              >
                {isLoading ? (
                  <span>Suche...</span>
                ) : (
                  <span>Suchen</span>
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto border rounded-md">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
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
                            <p className="font-medium">{result.title}</p>
                            {result.original_title !== result.title && (
                              <p className="text-sm text-gray-500">
                                ({result.original_title})
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.vote_average.toFixed(1)} ⭐
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {result.release_date?.split('-')[0]} • {result.runtime} Min.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {result.genres.map(g => g.name).join(', ')}
                        </p>
                        {result.director && (
                          <p className="text-sm text-gray-600">
                            Regie: {result.director}
                          </p>
                        )}
                        {result.cast.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Cast: {result.cast.join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
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
  )
} 