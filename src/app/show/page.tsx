'use client'

import { useEffect, useState } from 'react'
import { Seat, SeatType } from '@/types/shows'
import { mockSeats } from '@/mocks/seats'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function ShowPage({ params }: { params: { showId: string } }) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Sitze laden
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
          setSeats(mockSeats)
        } else {
          const response = await fetch(`/api/shows/${params.showId}/seats`)
          const data = await response.json()
          setSeats(data)
        }
      } catch (error) {
        console.error('Failed to fetch seats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSeats()
  }, [params.showId])

  // Sitzkategorien definieren
  const seatTypes: SeatType[] = [
    { id: 'all', name: 'Alle Kategorien anzeigen', price: 0 },
    { id: 'standard', name: 'Standard (Reihe A-C)', price: 12.99 },
    { id: 'premium', name: 'Premium (Reihe D-F)', price: 15.99 },
    { id: 'loge', name: 'Loge (Reihe G-H)', price: 18.99 }
  ]

  // Hilfsfunktionen
  const getSeatCategory = (row: string): string => {
    if (['A', 'B', 'C'].includes(row)) return 'standard'
    if (['D', 'E', 'F'].includes(row)) return 'premium'
    return 'loge'
  }

  const getSeatPrice = (row: string): number => {
    const category = getSeatCategory(row)
    return seatTypes.find(t => t.id === category)?.price ?? 0
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId)
      return total + (seat ? getSeatPrice(seat.row) : 0)
    }, 0)
  }

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId)
    if (!seat || seat.status === 'occupied') return

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      }
      return [...prev, seatId]
    })
  }

  if (loading) {
    return <div>Lädt...</div>
  }

  // UI Rendering
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sitzplatzauswahl</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sitzplan */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kinosaalsitzplan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8 text-center p-4 bg-gray-800 text-white rounded">
                Leinwand
              </div>
              <div className="grid grid-cols-10 gap-2">
                {seats.map((seat) => {
                  const category = getSeatCategory(seat.row)
                  const isVisible = selectedCategory === 'all' || selectedCategory === category
                  return (
                    <button
                      key={seat.id}
                      className={`
                        p-2 rounded-lg text-sm transition-all
                        ${!isVisible ? 'opacity-20' : ''}
                        ${seat.status === 'occupied' ? 'bg-gray-300 cursor-not-allowed' :
                          selectedSeats.includes(seat.id) ? 'bg-green-500 text-white' :
                          category === 'standard' ? 'bg-blue-100 hover:bg-blue-200' :
                          category === 'premium' ? 'bg-purple-100 hover:bg-purple-200' :
                          'bg-yellow-100 hover:bg-yellow-200'}
                      `}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'occupied'}
                    >
                      {seat.row}-{seat.number}
                    </button>
                  )
                })}
              </div>
              
              {/* Legende */}
              <div className="mt-4 flex gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span>Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 rounded"></div>
                  <span>Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>Loge</span>
                  </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Belegt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Ausgewählt</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seitenleiste */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sitzplatzdetails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Kategoriefilter */}
                <div>
                  <Label>Kategorie anzeigen</Label>
                  <RadioGroup
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="mt-2 space-y-2"
                  >
                    {seatTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label htmlFor={type.id}>
                          {type.name} {type.id !== 'all' && `(${type.price.toFixed(2)}€)`}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Ausgewählte Sitze */}
                <div>
                  <Label>Ausgewählte Sitze</Label>
                  <div className="mt-2">
                    {selectedSeats.length === 0 ? (
                      <p className="text-gray-500">Keine Sitze ausgewählt</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedSeats.map(seatId => {
                          const seat = seats.find(s => s.id === seatId)
                          return seat && (
                            <div key={seatId} className="flex justify-between">
                              <span>Reihe {seat.row}, Sitz {seat.number}</span>
                              <span>{getSeatPrice(seat.row).toFixed(2)}€</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gesamtpreis und Warenkorb-Button */}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold mb-4">
                    <span>Gesamtpreis:</span>
                    <span>{calculateTotal().toFixed(2)}€</span>
                  </div>
                  <Button 
                    className="w-full"
                    disabled={selectedSeats.length === 0}
                    onClick={() => {/* TODO: Implement checkout */}}
                  >
                    Zum Warenkorb
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}