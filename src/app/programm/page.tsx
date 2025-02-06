'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Show {
  id: number;
  movie_id: number;
  hall_id: number;
  start_time: string;
  title: string;
  name: string;
  description: string;
  image_url: string;
  available_seats?: number;
  hall_name: string;
  duration: number;
}

interface ShowGroups {
  [key: string]: Show[]
}

export default function Programm() {
  const [showGroups, setShowGroups] = useState<ShowGroups>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadShows = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching shows...');
        
        // Absolute URL verwenden
        const response = await fetch(`${process.env.BACKEND_URL}/shows/details`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Shows konnten nicht geladen werden');
        
        const shows = await response.json();
        console.log('Received shows:', shows);
        
        // Gruppiere Shows nach Tagen
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filtere zuerst die vergangenen Vorstellungen aus
        const currentTime = new Date();
        const futureShows = shows.filter((show: Show) => {
          const showTime = new Date(show.start_time);
          return showTime > currentTime;
        });

        const grouped = futureShows.reduce((acc: { [key: string]: Show[] }, show: Show) => {
          const showDate = new Date(show.start_time)
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          // Vergleiche nur das Datum, nicht die Uhrzeit
          const isToday = showDate.toDateString() === today.toDateString()
          const isTomorrow = showDate.toDateString() === tomorrow.toDateString()
          
          const dateKey = isToday 
            ? 'Heute'
            : isTomorrow
              ? 'Morgen'
              : showDate.toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
          
          if (!acc[dateKey]) {
            acc[dateKey] = []
          }
          acc[dateKey].push(show)
          return acc
        }, {})

        // Sortiere die Shows nach Startzeit innerhalb jedes Tages
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a: Show, b: Show) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          )
        })

        setShowGroups(grouped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    loadShows()
  }, [])

  const handleShowClick = (showing: Show) => {
    router.push(`/movie/${showing.movie_id}?showId=${showing.id}`);
  };

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

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {Object.entries(showGroups)
            .sort(([dateA], [dateB]) => {
              if (dateA === 'Heute') return -1;
              if (dateB === 'Heute') return 1;
              if (dateA === 'Morgen') return -1;
              if (dateB === 'Morgen') return 1;
              return 0;
            })
            .map(([date, showings]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {date}
                  </h2>
                  <div className="text-sm text-gray-400 font-medium">
                    {showings.length} {showings.length === 1 ? 'Vorführung' : 'Vorführungen'}
                  </div>
                  <div className="flex-1 border-b border-gray-800" />
                </div>

                <div className="grid gap-4">
                  {showings
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((showing) => (
                      <div key={showing.id} className="bg-[#2C2C2C] rounded-xl overflow-hidden">
                        <div className="flex items-stretch">
                          <div className="w-[120px] relative">
                            <div className="aspect-[2/3] relative">
                              <Image
                                src={showing.image_url}
                                alt={showing.title}
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="text-2xl font-bold text-white mb-3">
                                {showing.title}
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="text-lg font-semibold text-white">
                                    {formatTime(showing.start_time)} Uhr
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleShowClick(showing)}
                                className="bg-red-600 hover:bg-red-700 text-white 
                                         px-6 py-2 rounded-lg transition-all duration-200 
                                         hover:scale-105 text-sm font-medium"
                              >
                                Tickets buchen
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {Object.keys(showGroups).length === 0 && (
          <div className="text-center text-gray-400 py-12">
            Keine Vorführungen gefunden
          </div>
        )}
      </div>
    </div>
  )
}