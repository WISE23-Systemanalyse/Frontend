'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchShow, fetchHalls, fetchMovies, updateShow } from './fetchdata'
import { SearchableSelect } from "@/components/ui/select"

interface EditShowingClientProps {
  params: {
    id: string
  }
}

interface Movie {
  id: number
  title: string
}

interface Hall {
  id: number
  name: string
}

interface Show {
  id: number
  movie_id: number
  hall_id: number
  start_time: string
}

interface MovieOption {
  value: string;
  label: string;
}

export default function EditShowingClient({ params }: EditShowingClientProps) {
  const router = useRouter()
  const [show, setShow] = useState<Show | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null)
  const [selectedHall, setSelectedHall] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  });

  useEffect(() => {
    const loadShow = async () => {
      try {
        console.log('Lade Vorstellung...')
        console.log('ID:', params.id)
        const showData = await fetchShow(params.id)
        console.log('Geladene Vorstellung:', showData)
        
        if (!showData) {
          setError('Keine Daten für diese Vorstellung gefunden')
          return
        }

        setShow(showData)

        // Setze die initialen Werte nur wenn die benötigten Daten existieren
        if (showData.start_time && showData.hall_id !== undefined) {
          const startTime = new Date(showData.start_time)
          
          // Formatiere das Datum für das Input-Feld (YYYY-MM-DD)
          const year = startTime.getFullYear()
          const month = String(startTime.getMonth() + 1).padStart(2, '0')
          const day = String(startTime.getDate()).padStart(2, '0')
          const formattedDate = `${year}-${month}-${day}`
          
          // Formatiere die Zeit für das Input-Feld (HH:mm)
          const hours = String(startTime.getHours()).padStart(2, '0')
          const minutes = String(startTime.getMinutes()).padStart(2, '0')
          const formattedTime = `${hours}:${minutes}`

          setDate(formattedDate)
          setTime(formattedTime)
          setSelectedHall(showData.hall_id.toString())
          // Setze einen initialen Preis von 1500 (15,00 €)
          setPrice('1500')
        }
      } catch (err) {
        setError('Vorstellung konnte nicht geladen werden')
        console.error(err)
      }
    }

    const loadMoviesAndHalls = async () => {
      try {
        const [moviesData, hallsData] = await Promise.all([
          fetchMovies(),
          fetchHalls()
        ])
        setMovies(moviesData)
        setHalls(hallsData)

        console.log('Geladene Filme:', moviesData)
        console.log('Geladene Halls:', hallsData)

        // Wenn show und movies geladen sind, setze den ausgewählten Film und Saal
        if (show) {
          // Film setzen
          if (show.movie_id) {
            const currentMovie = moviesData.find((movie: { id: number }) => movie.id === show.movie_id)
            if (currentMovie) {
              setSelectedMovie({
                value: currentMovie.id.toString(),
                label: currentMovie.title
              })
            }
          }

          // Saal setzen
          if (show.hall_id) {
            const currentHall = hallsData.find((hall: { id: number }) => hall.id === show.hall_id)
            if (currentHall) {
              setSelectedHall(currentHall.id.toString())
            }
          }
        }
      } catch (err) {
        setError('Daten konnten nicht geladen werden')
        console.error(err)
      }
    }

    // Lade die Daten
    Promise.all([loadShow(), loadMoviesAndHalls()])
      .catch(err => {
        console.error('Fehler beim Laden der Daten:', err)
        setError('Fehler beim Laden der Daten')
      })
  }, [params.id, show?.movie_id, show?.hall_id, show])

  const handleSubmit = async () => {
    if (!selectedMovie || !selectedHall || !date || !time) {
      setToast({
        message: 'Bitte füllen Sie alle Felder aus',
        variant: 'error',
        isVisible: true
      });
      return;
    }

    try {
      setIsLoading(true);
      setToast({
        message: 'Vorstellung wird aktualisiert...',
        variant: 'loading',
        isVisible: true
      });

      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      const showData = {
        id: parseInt(params.id),
        movie_id: parseInt(selectedMovie.value),
        hall_id: parseInt(selectedHall),
        start_time: startTime.toISOString()
      };

      console.log('Sende Update:', showData);
      await updateShow(params.id, showData);

      setToast({
        message: 'Vorstellung wurde erfolgreich aktualisiert!',
        variant: 'success',
        isVisible: true
      });

      setTimeout(() => {
        router.push('/admin/shows');
      }, 1000);

    } catch (err) {
      console.error(err);
      setToast({
        message: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        variant: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieChange = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      const movie = movies.find(m => m.id === parseInt(selectedOption.value));
      if (movie) {
        setSelectedMovie({
          value: movie.id.toString(),
          label: movie.title
        });
      }
    } else {
      setSelectedMovie(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white">Lade Vorstellung...</div>
      </div>
    )
  }

  const movieOptions = movies.map(movie => ({
    value: movie.id.toString(),
    label: movie.title
  }));

  return (
    <div className="min-h-screen bg-[#141414]">
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
              onClick={() => router.push('/admin/shows')}
            >
              <ChevronLeft className="h-5 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Vorstellung bearbeiten</h1>
          </div>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <CardHeader>
            <CardTitle className="text-white">Vorstellung bearbeiten</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Film</label>
                <SearchableSelect
                  options={movieOptions}
                  value={selectedMovie}
                  onChange={handleMovieChange}
                  placeholder="Film suchen..."
                  className="bg-[#3C3C3C] border-0"
                  noOptionsMessage={({ inputValue }) => 
                    !inputValue ? null : "Keine Filme gefunden"
                  }
                  filterOption={(option, inputValue) => {
                    if (!inputValue?.trim()) return false;
                    return option.label.toLowerCase().includes(inputValue.toLowerCase());
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Saal</label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger className="bg-[#3C3C3C] text-white border-0">
                    <SelectValue placeholder="Saal auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3C3C3C] border-0">
                    {halls.map(hall => (
                      <SelectItem 
                        key={hall.id} 
                        value={hall.id.toString()}
                        className="text-white hover:bg-[#4C4C4C] focus:bg-[#4C4C4C] cursor-pointer"
                      >
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Datum</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#3C3C3C] text-white border-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Uhrzeit</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-[#3C3C3C] text-white border-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Preis (in Cent)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-[#3C3C3C] text-white border-0"
                  placeholder="1500"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/shows')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 