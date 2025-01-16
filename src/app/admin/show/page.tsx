"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchHalls, fetchMovies, createShow } from './fetchdata'
import Select from 'react-select'

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

interface MovieOption {
  value: string;
  label: string;
}

export default function CreateScreening() {
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
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '40px',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem'
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.375rem',
      marginTop: '4px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  const handleMovieChange = (selectedOption: MovieOption | null) => {
    setSelectedMovie(selectedOption);
    if (selectedOption) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setScreening(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Kombiniere Datum und Zeit und interpretiere sie als UTC
      const [year, month, day] = screening.date.split('-').map(Number);
      const [hours, minutes] = screening.time.split(':').map(Number);
      
      // Erstelle das Datum direkt in UTC
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      
      const showData = {
        movie_id: screening.movieId,
        hall_id: screening.theaterId,
        start_time: dateTime.toISOString()
      };

      await createShow(showData);

      // Reset form after successful submission
      setScreening({
        movieId: '',
        theaterId: '',
        date: '',
        time: ''
      });
      setSelectedMovie(null);

      // Optional: Erfolgsmeldung anzeigen
      alert('Vorstellung wurde erfolgreich angelegt!');

    } catch (err) {
      console.error(err);
      setSubmitError(
        err instanceof Error 
          ? err.message 
          : 'Ein Fehler ist beim Anlegen der Vorstellung aufgetreten'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Lade Daten...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Neue Vorstellung anlegen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label>Film</label>
            <Select
              options={movieOptions}
              onChange={handleMovieChange}
              value={selectedMovie}
              defaultInputValue={selectedMovie?.label || ''}
              placeholder="Film suchen..."
              noOptionsMessage={({ inputValue }) => 
                !inputValue ? null : "Keine Filme gefunden"
              }
              filterOption={(option, inputValue) => {
                if (!inputValue?.trim()) return false;
                return option.label.toLowerCase().includes(inputValue.toLowerCase());
              }}
              styles={{
                ...customStyles,
                input: (base) => ({
                  ...base,
                  cursor: 'text',
                  caretColor: 'auto'
                }),
                control: (base) => ({
                  ...base,
                  minHeight: '40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  cursor: 'text'
                })
              }}
              isSearchable={true}
              isClearable={true}
              components={{ DropdownIndicator: null }}
              menuIsOpen={menuIsOpen}
              onInputChange={(newValue, { action }) => {
                if (action === 'input-change') {
                  setMenuIsOpen(!!newValue?.trim());
                }
              }}
              onFocus={() => setMenuIsOpen(false)}
              openMenuOnFocus={false}
              blurInputOnSelect={false}
            />
          </div>

          <div>
            <DropdownMenu>Saal</DropdownMenu>
            <select
              id="theaterId"
              name="theaterId"
              value={screening.theaterId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Wähle einen Saal</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} (Kapazität: {hall.seating_capacity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <DropdownMenu>Datum</DropdownMenu>
            <Input
              id="date"
              name="date"
              type="date"
              value={screening.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <DropdownMenu>Uhrzeit</DropdownMenu>
            <Input
              id="time"
              name="time"
              type="time"
              value={screening.time}
              onChange={handleChange}
              required
            />
          </div>
          {submitError && (
            <p className="text-red-500 text-sm mt-2">{submitError}</p>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird angelegt...' : 'Vorstellung anlegen'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

