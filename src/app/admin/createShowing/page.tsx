'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Toast } from "@/components/ui/toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Movie {
  id: number
  title: string
}

interface Hall {
  id: number
  name: string
}

const API_BASE_URL = process.env.BACKEND_URL

export default function CreateShowing() {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [selectedMovie, setSelectedMovie] = useState<string>('')
  const [selectedHall, setSelectedHall] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    fetchMoviesAndHalls()
  }, [])

  const fetchMoviesAndHalls = async () => {
    if (!API_BASE_URL) return

    try {
      const [moviesRes, hallsRes] = await Promise.all([
        fetch('https://api.kts.testcode.tools/movies'),
        fetch('https://api.kts.testcode.tools/halls')
      ])

      if (!moviesRes.ok || !hallsRes.ok) throw new Error('Daten konnten nicht geladen werden')

      const moviesData = await moviesRes.json()
      const hallsData = await hallsRes.json()

      setMovies(moviesData)
      setHalls(hallsData)
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
      setToast({
        message: 'Fehler beim Laden der Daten',
        variant: 'error',
        isVisible: true
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedMovie || !selectedHall || !date || !time) {
      setToast({
        message: 'Bitte füllen Sie alle Felder aus',
        variant: 'error',
        isVisible: true
      })
      return
    }

    try {
      setIsLoading(true)
      setToast({
        message: 'Vorstellung wird erstellt...',
        variant: 'loading',
        isVisible: true
      })

      const startTime = new Date(`${date}T${time}`).toISOString()
      
      const endTime = new Date(`${date}T${time}`)
      endTime.setHours(endTime.getHours() + 2)
      endTime.setMinutes(endTime.getMinutes() + 15)

      const response = await fetch('https://api.kts.testcode.tools/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: parseInt(selectedMovie),
          hall_id: parseInt(selectedHall),
          start_time: startTime,
          end_time: endTime.toISOString(),
          price: 1500
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server Antwort:', errorData)
        throw new Error('Vorstellung konnte nicht erstellt werden')
      }

      setToast({
        message: 'Vorstellung wurde erfolgreich erstellt!',
        variant: 'success',
        isVisible: true
      })

      setTimeout(() => {
        router.push('/admin/shows')
      }, 500)
    } catch (error) {
      setToast({
        message: 'Fehler beim Erstellen der Vorstellung',
        variant: 'error',
        isVisible: true
      })
      console.error('Fehler beim Erstellen:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Film</label>
                <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                  <SelectTrigger className="bg-[#3C3C3C] text-white border-0">
                    <SelectValue placeholder="Film auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3C3C3C] border-0">
                    {movies.map(movie => (
                      <SelectItem 
                        key={movie.id} 
                        value={movie.id.toString()}
                        className="text-white hover:bg-[#4C4C4C] focus:bg-[#4C4C4C] cursor-pointer"
                      >
                        {movie.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Saal</label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
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
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Datum</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#3C3C3C] text-white border-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Uhrzeit</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-[#3C3C3C] text-white border-0"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/shows')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 