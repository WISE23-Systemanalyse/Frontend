'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchShows } from './fetchdata'
import Image from 'next/image'

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
}

interface ShowGroups {
  [key: string]: Show[]
}

interface GroupedShow {
  movie_id: number;
  title: string;
  image_url: string;
  showings: {
    id: number;
    start_time: string;
    hall_name: string;
    available_seats?: number;
  }[];
}

export default function Programm() {
  const [showGroups, setShowGroups] = useState<ShowGroups>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadShows = async () => {
      try {
        const shows = await fetchShows({}) as unknown as Show[]
        
        // Gruppiere Shows nach Tagen
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // Filtere zuerst die vergangenen Vorstellungen aus
        const currentTime = new Date()
        const futureShows = shows.filter(show => {
          const showTime = new Date(show.start_time)
          return showTime > currentTime
        })

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
          grouped[date].sort((a, b) => 
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

  // Hilfsfunktion zum Gruppieren der Vorstellungen nach Film
  const groupShowingsByMovie = (showings: Show[]): GroupedShow[] => {
    const grouped = showings.reduce((acc: { [key: number]: GroupedShow }, show) => {
      if (!acc[show.movie_id]) {
        acc[show.movie_id] = {
          movie_id: show.movie_id,
          title: show.title,
          image_url: show.image_url,
          showings: []
        };
      }
      acc[show.movie_id].showings.push({
        id: show.id,
        start_time: show.start_time,
        hall_name: show.name,
        available_seats: show.available_seats
      });
      return acc;
    }, {});

    // Sortiere die Vorstellungen nach Startzeit
    Object.values(grouped).forEach(group => {
      group.showings.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });

    return Object.values(grouped);
  };

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
            .map(([date, showings]) => {
              const groupedShowings = groupShowingsByMovie(showings);
              
              return (
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
                    {groupedShowings.map((group) => (
                      <div key={group.movie_id} className="bg-[#2C2C2C] rounded-xl overflow-hidden">
                        <div className="flex items-stretch">
                          {/* Linker Container: Filmbild */}
                          <div className="w-[140px] relative">
                            <Image
                              src={group.image_url}
                              alt={group.title}
                              fill
                              className="object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTAwIDc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzFjMWMxYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2VpbiBCaWxkIHZlcmbDvGdiYXI8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>

                          {/* Mittlerer Container: Titel und Info-Kachel */}
                          <div className="flex-1 p-6 flex flex-col min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="text-xl font-bold text-white">
                                {group.title}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                <span>Vorstellungen</span>
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto scrollbar-hide">
                              <div className="flex gap-4 pb-4 scroll-smooth" id={`scroll-${group.movie_id}`}>
                                {group.showings.map((showing) => (
                                  <Link
                                    key={showing.id}
                                    href={`/movie/${group.movie_id}?showId=${showing.id}&date=${new Date(showing.start_time).getDate()}&month=${new Date(showing.start_time).toLocaleString("de-DE", { month: "long" })}&showSeats=true`}
                                    className="group flex flex-col items-center p-4 rounded-lg transition-all 
                                             bg-neutral-800/50 hover:bg-neutral-700/50 
                                             min-w-[120px] border border-red-500/10
                                             hover:border-red-500/30 relative overflow-hidden
                                             hover:z-10 cursor-pointer"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-80" />
                                    
                                    <div className="relative z-10 transform group-hover:scale-105 transition-transform">
                                      <div className="text-lg font-semibold mb-1 text-white group-hover:text-red-400 transition-colors">
                                        {formatDateTime(showing.start_time).time}
                                      </div>
                                      <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                                        Saal {showing.hall_name}
                                      </div>
                                      {showing.available_seats !== undefined && (
                                        <div className="text-xs mt-2 text-red-400/50 group-hover:text-red-400/70 transition-colors">
                                          {showing.available_seats} freie Plätze
                                        </div>
                                      )}
                                      
                                      <div className="mt-2 text-xs text-red-400/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <span>Tickets buchen</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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