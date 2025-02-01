'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import { deleteShow, fetchMovies, fetchHalls } from './fetchdata'

interface Showing {
  id: number
  movie_id: number
  hall_id: number
  start_time: string
  end_time: string
  movie_title?: string
  hall_name?: string
  price: number
}

interface Movie {
  id: number
  title: string
  description: string
  image_url: string
}

interface Hall {
  id: number
  name: string
  seating_capacity: number
}

const API_BASE_URL = process.env.BACKEND_URL

export default function Showings() {
  const router = useRouter()
  const [showings, setShowings] = useState<Showing[]>([])
  const [, setMovies] = useState<Movie[]>([])
  const [, setHalls] = useState<Hall[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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
    const loadData = async () => {
      try {
        const [showingsData, moviesData, hallsData] = await Promise.all([
          fetch(`${API_BASE_URL}/shows/details`).then(res => res.json()),
          fetchMovies(),
          fetchHalls()
        ]);

        // Anreicherung der Shows mit Film- und Saal-Details
        const enrichedShowings = showingsData.map((showing: Showing) => {
          const movie = moviesData.find((m: Movie) => m.id === showing.movie_id);
          const hall = hallsData.find((h: Hall) => h.id === showing.hall_id);
          
          return {
            ...showing,
            movie_title: movie?.title || 'Unbekannter Film',
            hall_name: `${hall?.name || 'Unbekannter Saal'} (${hall?.seating_capacity || '?'} Plätze)`
          };
        });

        setShowings(enrichedShowings);
        setMovies(moviesData);
        setHalls(hallsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setToast({
          message: 'Fehler beim Laden der Daten',
          variant: 'error',
          isVisible: true
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Vorstellung wirklich löschen?')) {
        return;
    }

    try {
        setIsLoading(true);
        setToast({
            message: 'Vorstellung wird gelöscht...',
            variant: 'loading',
            isVisible: true
        });

        await deleteShow(id);

        // Aktualisiere die lokale Liste, indem die gelöschte Show entfernt wird
        setShowings(prevShowings => prevShowings.filter(show => show.id !== parseInt(id)));

        setToast({
            message: 'Vorstellung wurde erfolgreich gelöscht!',
            variant: 'success',
            isVisible: true
        });

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

  const filteredShowings = showings.filter(showing => {
    const startDateTime = new Date(showing.start_time)
    const date = startDateTime.toLocaleDateString()
    const time = startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    return (
      showing.movie_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showing.hall_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      date.includes(searchTerm) ||
      time.includes(searchTerm)
    )
  })

  // Gruppiere Vorstellungen nach Sälen
  const showingsByHall = filteredShowings.reduce((acc: { [key: string]: Showing[] }, showing) => {
    const hallName = showing.hall_name || 'Unbekannter Saal'
    if (!acc[hallName]) {
      acc[hallName] = []
    }
    acc[hallName].push(showing)
    return acc
  }, {})

  const formatDateTime = (utcDateString: string) => {
    const date = new Date(utcDateString);
    
    return {
      date: date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      }),
      time: date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      })
    };
  };

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
              onClick={() => router.push('/admin')}
            >
              <ChevronLeft className="h-5 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Vorstellungen</h1>
          </div>
          <Button 
            onClick={() => router.push('/admin/createShow')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Vorstellung
          </Button>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Alle Vorstellungen</CardTitle>
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Lädt...</div>
            ) : Object.keys(showingsByHall).length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {searchTerm ? 'Keine Vorstellungen gefunden' : 'Noch keine Vorstellungen vorhanden'}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(showingsByHall).map(([hallName, hallShowings]) => (
                  <div key={hallName} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-bold text-white">{hallName}</h2>
                      <div className="text-sm text-gray-400">
                        {hallShowings.length} {hallShowings.length === 1 ? 'Vorstellung' : 'Vorstellungen'}
                      </div>
                      <div className="flex-1 border-b border-gray-800" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hallShowings.map(showing => {

                        return (
                          <div 
                            key={showing.id}
                            className="bg-[#3C3C3C] rounded-lg overflow-hidden hover:bg-[#4C4C4C] transition-colors"
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-white font-medium text-lg">{showing.movie_title}</h3>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/admin/editShowing/${showing.id}`)}
                                    className="hover:bg-blue-500/20 text-blue-500"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(showing.id.toString())}
                                    className="hover:bg-red-500/20 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-400">
                                  <div className="w-24 flex-shrink-0">Datum:</div>
                                  <div className="text-white">
                                    {formatDateTime(showing.start_time).date}
                                  </div>
                                </div>
                                
                                <div className="flex items-center text-gray-400">
                                  <div className="w-24 flex-shrink-0">Zeit:</div>
                                  <div className="text-white">
                                    {formatDateTime(showing.start_time).time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 