'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Movie {
  id: string
  title: string
  description: string
  duration: number
  year: number
  imageUrl: string
  rating: number
  genres: string[]
}

const API_BASE_URL = process.env.BACKEND_URL

export default function MoviesOverview() {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    movieId: ''
  })

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/movies`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMovies(data)
    } catch (err) {
      console.error('Fehler beim Laden der Filme:', err)
      setError('Filme konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDialog({ isOpen: true, movieId: id })
  }

  const confirmDelete = async () => {
    const id = confirmDialog.movieId
    try {
      setToast({
        message: 'Film wird gelöscht...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Film konnte nicht gelöscht werden')
      
      setMovies(movies.filter(movie => movie.id !== id))
      setToast({
        message: 'Film wurde erfolgreich gelöscht!',
        variant: 'success',
        isVisible: true
      })
    } catch (error) {
      setToast({
        message: 'Film konnte nicht gelöscht werden',
        variant: 'error',
        isVisible: true
      })
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Film löschen"
        message="Möchten Sie diesen Film wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
      <div className="max-w-[1600px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Filmverwaltung</h1>
          <Link href="/admin/createMovie">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Neuen Film anlegen
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-white text-center py-8">Lade Filme...</div>
        ) : error ? (
          <div className="bg-[#2C2C2C] p-4 rounded text-red-500">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-white text-center py-8">
            Keine Filme gefunden
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="group relative">
                <div className="aspect-[2/3] overflow-hidden rounded-md">
                  <img 
                    src={movie.imageUrl} 
                    alt={movie.title}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-md">
                  <h2 className="text-lg font-bold text-white mb-1">{movie.title}</h2>
                  <p className="text-sm text-gray-300 mb-1">
                    {movie.year} • {movie.duration} Min. • ⭐ {movie.rating}
                  </p>
                  <p className="text-sm text-gray-300 mb-2">{movie.genres.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{movie.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => router.push(`/admin/editMovie/${movie.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1"
                    >
                      Bearbeiten
                    </Button>
                    <Button 
                      onClick={() => handleDelete(movie.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1"
                    >
                      Löschen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 