'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import { SeatEditor } from "@/components/admin/SeatEditor"

interface Seat {
  id: number
  hall_id: number
  row_number: number
  seat_number: number
  seat_type: string
}

interface NewSeat {
  hall_id: number
  row_number: number
  seat_number: number
  seat_type: string
}

interface Hall {
  id: number
  name: string
  seating_capacity: number
  seats: Seat[]
}

const API_BASE_URL = process.env.BACKEND_URL

export default function EditHall() {
  const router = useRouter()
  const { id: hallId } = useParams()
  const [hall, setHall] = useState<Hall | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
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
    const fetchHall = async () => {
      if (!API_BASE_URL) return

      try {
        const response = await fetch(`${API_BASE_URL}/halls/${hallId}`)
        if (!response.ok) throw new Error('Saal konnte nicht geladen werden')
        const data = await response.json()
        setHall(data)
        setSelectedSeats(data.seats || [])
      } catch (err) {
        setError('Saal konnte nicht geladen werden')
        console.error(err)
      }
    }

    fetchHall()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hall || !API_BASE_URL || !hallId) return

    try {
      setIsLoading(true)
      setToast({
        message: 'Saal wird gespeichert...',
        variant: 'loading',
        isVisible: true
      })

      // 1. Saal aktualisieren
      const hallResponse = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: hallId,
          name: hall.name,
          seating_capacity: selectedSeats.length
        })
      })

      if (!hallResponse.ok) {
        const errorText = await hallResponse.text()
        console.error('Hall Update Error:', errorText)
        throw new Error('Saal konnte nicht aktualisiert werden')
      }

      // 2. Sitze synchronisieren
      const seatsToSync: NewSeat[] = selectedSeats.map(seat => ({
        hall_id: parseInt(hallId as string),
        row_number: seat.row_number,
        seat_number: seat.seat_number,
        seat_type: seat.seat_type
      }))

      try {
        const syncResponse = await fetch(`${API_BASE_URL}/seats/halls/${hallId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seatsToSync)
        })

        if (!syncResponse.ok) {
          const errorText = await syncResponse.text()
          console.error('Sync Error:', errorText)
          throw new Error(`Sitze konnten nicht synchronisiert werden: ${errorText}`)
        }

        const syncResult = await syncResponse.json()
        console.log('Sync Result:', syncResult)
      } catch (syncError) {
        console.error('Sync Error:', syncError)
        throw new Error('Sitze konnten nicht synchronisiert werden')
      }

      setToast({
        message: 'Saal wurde erfolgreich aktualisiert!',
        variant: 'success',
        isVisible: true
      })

      setTimeout(() => {
        router.push('/admin/halls')
      }, 500)
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'error',
        isVisible: true
      })
      console.error('Fehler beim Speichern:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hall) return null

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
              onClick={() => router.push('/admin/halls')}
            >
              <ChevronLeft className="h-5 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Saal bearbeiten</h1>
          </div>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="text-white">Saal: {hall.name}</CardTitle>
                <p className="text-gray-400">{selectedSeats.length} Sitzplätze</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
                <Button 
                  onClick={() => router.push('/admin/halls')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Input
                placeholder="Saalname"
                value={hall.name}
                onChange={(e) => setHall({ ...hall, name: e.target.value })}
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
              />
              
              <SeatEditor
                seats={selectedSeats}
                onChange={setSelectedSeats}
                hallId={parseInt(hallId as string)}
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 