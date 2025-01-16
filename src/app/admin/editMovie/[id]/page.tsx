'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface Movie {
  id: string | number
  title: string
  description: string
  duration: number
  year: number
  imageUrl: string
  rating: number
  genres: string[]
}

const API_BASE_URL = process.env.BACKEND_URL

export default function EditMovie() {
  const router = useRouter()
  const movieId = useParams().id
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading] = useState(false)
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

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`)
        if (!response.ok) throw new Error('Film konnte nicht geladen werden')
        const data = await response.json()
        setMovie(data)
      } catch (err) {
        setError('Film konnte nicht geladen werden')
        console.error(err)
      }
    }

    fetchMovie()
  }, [movieId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movie) return

    try {
      setToast({
        message: 'Film wird gespeichert...',
        variant: 'loading',
        isVisible: true
      })

      const movieData = {
        id: movieId,
        title: movie.title,
        year: Number(movie.year),
        description: movie.description,
        rating: Number(movie.rating),
        imageUrl: movie.imageUrl,
        genres: movie.genres,
        duration: Number(movie.duration)
      }

      const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Film konnte nicht aktualisiert werden')
      }
      
      setToast({
        message: 'Film wurde erfolgreich aktualisiert!',
        variant: 'success',
        isVisible: true
      })

      setTimeout(() => {
        router.push('/admin/movies')
      }, 500)
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Film konnte nicht aktualisiert werden',
        variant: 'error',
        isVisible: true
      })
      console.error(err)
    }
  }

  if (!movie) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-red-500 transition-colors"
              onClick={() => router.push('/admin/movies')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Film bearbeiten</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Form Card */}
          <Card className="flex-1 bg-[#2C2C2C] border-0">
            <CardHeader>
              <CardTitle className="text-white">Filminformationen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  placeholder="Filmtitel"
                  value={movie.title}
                  onChange={(e) => setMovie({...movie, title: e.target.value})}
                  className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                />
                <Textarea
                  placeholder="Beschreibung"
                  value={movie.description}
                  onChange={(e) => setMovie({...movie, description: e.target.value})}
                  className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400 min-h-[160px]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Dauer (in Minuten)"
                    value={movie.duration}
                    onChange={(e) => setMovie({...movie, duration: parseInt(e.target.value) || 0})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                  <Input
                    type="number"
                    placeholder="Jahr"
                    value={movie.year}
                    onChange={(e) => setMovie({...movie, year: parseInt(e.target.value) || 0})}
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Bewertung"
                  value={movie.rating}
                  onChange={(e) => setMovie({...movie, rating: parseFloat(e.target.value) || 0})}
                  className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Bild-URL"
                  value={movie.imageUrl}
                  onChange={(e) => setMovie({...movie, imageUrl: e.target.value})}
                  className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
                />
                
                {/* Genres */}
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

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                    {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => router.push('/admin/movies')}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="w-[350px] bg-[#2C2C2C] border-0">
            <CardHeader>
              <CardTitle className="text-white">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[2/3] relative mb-4 overflow-hidden rounded-md">
                <Image
                  src={movie.imageUrl}
                  alt={movie.title}
                  width={500}
                  height={750}
                  layout="responsive"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{movie.title}</h2>
              <p className="text-gray-400 text-sm mb-2">
                {movie.year} • {movie.duration} Min. • ⭐ {movie.rating}
              </p>
              <p className="text-gray-400 text-sm mb-2">{movie.genres.join(', ')}</p>
              <p className="text-gray-400 text-sm line-clamp-3">{movie.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 