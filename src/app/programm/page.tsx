'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchShows } from './fetchdata'

interface Show {
  id: number;
  movie_id: number;
  hall_id: number;
  start_time: string;
  title: string;
  name: string;
  description: string;
  image_url: string;
}

interface ShowGroups {
  [key: string]: Show[]
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
        
        const grouped = shows.reduce((acc: { [key: string]: Show[] }, show: Show) => {
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

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Vorführungen nach Datum gruppiert */}
        <div className="space-y-12">
          {Object.entries(showGroups)
            .sort(([dateA], [dateB]) => {
              if (dateA === 'Heute') return -1
              if (dateB === 'Heute') return 1
              if (dateA === 'Morgen') return -1
              if (dateB === 'Morgen') return 1
              return 0
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
                  {showings.map((showing) => (
                    <div key={showing.id} className="bg-[#2C2C2C] rounded-xl overflow-hidden">
                      <div className="flex">
                        {/* Filmbild */}
                        <div className="w-[100px] h-[150px] flex-shrink-0">
                          <div className="relative w-full h-full">
                            <img
                              src={showing.image_url}
                              alt={showing.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTAwIDc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzFjMWMxYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2VpbiBCaWxkIHZlcmbDvGdiYXI8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>
                        </div>

                        {/* Vorführungsdetails */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-2">
                              <div className="text-lg text-white font-bold">
                                {showing.title}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-xl font-bold text-red-600">
                                  {new Date(showing.start_time).toLocaleTimeString('de-DE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Saal {showing.name}
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/booking/${showing.id}`}
                              className="bg-red-600 text-white px-6 py-3 rounded-lg 
                                       hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                              Tickets buchen
                            </Link>
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