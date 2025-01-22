'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
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
}

interface ShowGroups {
  today: Show[];
  upcoming: Show[];
}

export default function Program() {
  const [showGroups, setShowGroups] = useState<ShowGroups>({ today: [], upcoming: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadShows = async () => {
      try {
        const shows = await fetchShows({}) as unknown as Show[]
        
        // Gruppiere Shows in "Heute" und "Demnächst"
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const grouped = shows.reduce((acc: ShowGroups, show: Show) => {
          const showDate = new Date(show.start_time)
          showDate.setHours(0, 0, 0, 0)
          
          if (showDate.getTime() === today.getTime()) {
            acc.today.push(show)
          } else if (showDate.getTime() > today.getTime()) {
            acc.upcoming.push(show)
          }
          return acc
        }, { today: [], upcoming: [] })

        // Sortiere die Shows nach Startzeit
        grouped.today.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        grouped.upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

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
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="max-w-7xl w-[85%] mx-auto">
        {showGroups.today.length === 0 && showGroups.upcoming.length === 0 ? (
          <p className="text-white text-center">Keine Vorstellungen gefunden</p>
        ) : (
          <>
            {/* Heute */}
            {showGroups.today.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Heute</h2>
                <div className="relative overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide -mx-8">
                    <div className="flex gap-6 px-8 py-4">
                      {showGroups.today.map((show) => (
                        <div key={show.id} className="flex-none w-[250px]">
                          <ShowCard show={show} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Demnächst */}
            {showGroups.upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Demnächst</h2>
                <div className="relative overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide -mx-8">
                    <div className="flex gap-6 px-8 py-4">
                      {showGroups.upcoming.map((show) => (
                        <div key={show.id} className="flex-none w-[250px]">
                          <ShowCard show={show} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ShowCard Komponente mit Homepage-ähnlichem Hover-Effekt
const ShowCard = ({ show }: { show: Show }) => (
  <Link href={`/movie/${show.movie_id}`}>
    <Card className="bg-[#2C2C2C] border-0 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer hover:ring-2 hover:ring-red-600">
      <div className="aspect-[2/3] relative">
        <Image
          src={show.image_url || '/placeholder.jpg'}
          alt={show.title}
          width={500}
          height={750}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 min-h-[3.5rem]" title={show.title}>
          {show.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>{show.name}</p>
          <p>{new Date(show.start_time).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })} Uhr</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);