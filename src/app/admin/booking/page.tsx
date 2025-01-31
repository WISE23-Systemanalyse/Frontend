'use client'
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronDown, ChevronRight } from "lucide-react"
import { useRouter } from 'next/navigation'
import { fetchBookingDetails, fetchMovies } from './fetchdata'
import Image from 'next/image'

interface Booking {
  booking_id: number
  user_id: string
  show_id: number
  seat_id: number
  payment_id: number
  booking_time: string
  email: string
  first_name: string
  last_name: string
  user_name: string
  image_url: string
  movie_id: number
  hall_id: number
  start_time: string
  row_number: number
  seat_number: number
  seat_type: string
  amount: number
  payment_time: string
  tax: number
}

interface Movie {
  id: number
  title: string
  year: number
  description: string
  rating: number
  imageUrl: string
}

interface GroupedBookings {
  [key: number]: {
    start_time: string
    bookings: Booking[]
    movie?: Movie
  }
}

export default function AdminBookings() {
  const router = useRouter()
  const [groupedBookings, setGroupedBookings] = useState<GroupedBookings>({})
  const [expandedShows, setExpandedShows] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsData, moviesData] = await Promise.all([
          fetchBookingDetails(),
          fetchMovies()
        ])
        setMovies(moviesData)
        
        const grouped = bookingsData.reduce((acc: GroupedBookings, booking: Booking) => {
          if (!acc[booking.show_id]) {
            const movie = moviesData.find(m => m.id === booking.movie_id)
            acc[booking.show_id] = {
              start_time: booking.start_time,
              bookings: [],
              movie: movie
            }
          }
          acc[booking.show_id].bookings.push(booking)
          return acc
        }, {})
        
        setGroupedBookings(grouped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const toggleShow = (showId: number) => {
    setExpandedShows(prev => 
      prev.includes(showId) 
        ? prev.filter(id => id !== showId)
        : [...prev, showId]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filterBookings = (booking: Booking, searchTerm: string) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.email.toLowerCase().includes(searchLower) ||
      booking.user_name.toLowerCase().includes(searchLower) ||
      booking.booking_id.toString() === searchTerm
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414]">
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
            <h1 className="text-2xl font-bold text-white">Buchungen</h1>
          </div>
          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche nach Buchungs-ID, E-Mail oder Benutzername..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 text-white border-0 focus:ring-1 
                       focus:ring-red-500 h-10 rounded-lg w-full"
            />
          </div>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(groupedBookings).map(([showId, show]) => {
                const filteredBookings = show.bookings.filter((booking: Booking) => 
                  filterBookings(booking, searchTerm)
                )

                if (filteredBookings.length === 0) return null
                
                return (
                  <div key={showId} className="bg-[#3C3C3C] rounded-lg overflow-hidden">
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#4C4C4C] transition-colors"
                      onClick={() => toggleShow(parseInt(showId))}
                    >
                      <div className="flex items-center gap-4">
                        {show.movie && (
                          <div className="w-16 h-24 rounded-md overflow-hidden flex-shrink-0 bg-neutral-800">
                            {show.movie.imageUrl ? (
                              <Image 
                                src={show.movie.imageUrl} 
                                alt={show.movie.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load image:', show.movie.imageUrl)
                                  const target = e.target as HTMLImageElement
                                  target.src = '/default-movie.jpg'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-xs">Kein Bild</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          {show.movie && (
                            <h3 className="text-white font-medium text-lg mb-1">
                              {show.movie.title}
                            </h3>
                          )}
                          <p className="text-gray-400">
                            Vorstellung am {formatDate(show.start_time)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {filteredBookings.length} Buchungen
                          </p>
                        </div>
                      </div>
                      {expandedShows.includes(parseInt(showId)) 
                        ? <ChevronDown className="w-5 h-5 text-gray-400" />
                        : <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </div>

                    {expandedShows.includes(parseInt(showId)) && (
                      <div className="border-t border-[#2C2C2C]">
                        {filteredBookings.map((booking: {
                          booking_id: string;
                          email: string;
                          user_name: string;
                          image_url: string;
                          amount: number;
                          tax: number;
                          row_number: number;
                          seat_number: number;
                          seat_type: string;
                          booking_time: string;
                        }) => (
                          <div
                            key={booking.booking_id}
                            className="p-4 border-b border-[#2C2C2C] last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <Image 
                                    src={booking.image_url} 
                                    alt={booking.user_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{booking.user_name}</h4>
                                  <p className="text-sm text-gray-400">{booking.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-medium">
                                  {booking.amount.toFixed(2)} €
                                </div>
                                <div className="text-sm text-gray-400">
                                  inkl. {(booking.tax * 100).toFixed(0)}% MwSt.
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                              <div>
                                <span className="text-gray-400">Sitzplatz:</span>
                                <span className="text-white ml-2">
                                  Reihe {booking.row_number}, Platz {booking.seat_number} ({booking.seat_type})
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Buchungszeitpunkt:</span>
                                <span className="text-white ml-2">
                                  {formatDate(booking.booking_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {Object.keys(groupedBookings).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Keine Buchungen gefunden
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
