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
  show_id: number
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
    const loadData = async () => {
      try {
        const [showData, moviesData, hallsData] = await Promise.all([
          fetchShow(params.id),
          fetchMovies(),
          fetchHalls()
        ]);

        setShow(showData);
        setMovies(moviesData);
        setHalls(hallsData);

        if (showData) {
          // Setze Film
          const currentMovie = moviesData.find((movie: { id: number }) => movie.id === showData.movie_id);
          if (currentMovie) {
            setSelectedMovie({
              value: currentMovie.id.toString(),
              label: currentMovie.title
            });
          }

          // Setze Saal
          setSelectedHall(showData.hall_id.toString());

          // Setze Datum und Zeit
          const startTime = new Date(showData.start_time);
          
          const year = startTime.getUTCFullYear();
          const month = String(startTime.getUTCMonth() + 1).padStart(2, '0');
          const day = String(startTime.getUTCDate()).padStart(2, '0');
          setDate(`${year}-${month}-${day}`);
          
          const hours = String(startTime.getUTCHours()).padStart(2, '0');
          const minutes = String(startTime.getUTCMinutes()).padStart(2, '0');
          setTime(`${hours}:${minutes}`);
        }
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error(err);
      }
    };

    loadData();
  }, [params.id]);

  const handleMovieChange = (selectedOption: MovieOption | null) => {
    setSelectedMovie(selectedOption);
  };

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
        show_id: parseInt(params.id),
        movie_id: parseInt(selectedMovie.value),
        hall_id: parseInt(selectedHall),
        start_time: startTime.toISOString()
      };

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