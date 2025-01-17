"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchHalls, fetchMovies, createShow } from './fetchdata'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import { SearchableSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Hall {
    id: number;
    name: string;
    seating_capacity: number;
}

interface Movie {
    id: number;
    title: string;
    description: string;
    image_url: string;
}

export default function CreateScreening() {
  const router = useRouter()
  const [screening, setScreening] = useState({
    movieId: '',
    theaterId: '',
    date: '',
    time: ''
  })
  const [halls, setHalls] = useState<Hall[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  })
  const [, setMenuIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hallsData, moviesData] = await Promise.all([
          fetchHalls(),
          fetchMovies()
        ]);
        setHalls(hallsData);
        setMovies(moviesData);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const movieOptions = movies.map(movie => ({
    value: movie.id.toString(),
    label: movie.title
  }));

  const handleMovieChange = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      const movie: Movie = {
        id: parseInt(selectedOption.value),
        title: selectedOption.label,
        description: '',
        image_url: ''
      };
      setSelectedMovie(movie);
      setScreening(prev => ({
        ...prev,
        movieId: selectedOption.value
      }));
    } else {
      setScreening(prev => ({
        ...prev,
        movieId: ''
      }));
    }
    setMenuIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast({
      message: 'Vorstellung wird erstellt...',
      variant: 'loading',
      isVisible: true
    });

    try {
      const [year, month, day] = screening.date.split('-').map(Number);
      const [hours, minutes] = screening.time.split(':').map(Number);
      
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      
      const showData = {
        movie_id: screening.movieId,
        hall_id: screening.theaterId,
        start_time: dateTime.toISOString()
      };

      await createShow(showData);

      setToast({
        message: 'Vorstellung wurde erfolgreich erstellt!',
        variant: 'success',
        isVisible: true
      });

      setTimeout(() => {
        router.push('/admin/shows')
      }, 500);

    } catch (err) {
      console.error(err);
      setToast({
        message: err instanceof Error ? err.message : 'Fehler beim Erstellen der Vorstellung',
        variant: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Lade Daten...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
            <h1 className="text-2xl font-bold text-white">Neue Vorstellung</h1>
          </div>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <CardHeader>
            <CardTitle className="text-white">Vorstellung erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Film</label>
                <SearchableSelect
                  options={movieOptions}
                  value={selectedMovie ? { 
                    value: selectedMovie.id.toString(), 
                    label: selectedMovie.title 
                  } : null}
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
                <Select value={screening.theaterId} onValueChange={(value) => setScreening(prev => ({ ...prev, theaterId: value }))}>
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
                        {hall.name} (Kapazität: {hall.seating_capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Datum</label>
                <Input
                  type="date"
                  name="date"
                  value={screening.date}
                  onChange={(e) => setScreening(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-[#3C3C3C] text-white border-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Uhrzeit</label>
                <Input
                  type="time"
                  name="time"
                  value={screening.time}
                  onChange={(e) => setScreening(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-[#3C3C3C] text-white border-0"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/admin/shows')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

