'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Toast } from "@/components/ui/toast"

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

const API_BASE_URL = process.env.BACKEND_URL

export default function Showings() {
  const router = useRouter()
  const [showings, setShowings] = useState<Showing[]>([])
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
    fetchShowings()
  }, [])

  const fetchShowings = async () => {
    if (!API_BASE_URL) return

    try {
      const response = await fetch(`${API_BASE_URL}/shows/details`)
      if (!response.ok) throw new Error('Vorstellungen konnten nicht geladen werden')
      const data = await response.json()
      
      setShowings(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Fehler beim Laden der Vorstellungen:', error)
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!API_BASE_URL) return
    
    if (!confirm('Möchten Sie diese Vorstellung wirklich löschen?')) return

    try {
      setToast({
        message: 'Vorstellung wird gelöscht...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`${API_BASE_URL}/shows/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Vorstellung konnte nicht gelöscht werden')

      setToast({
        message: 'Vorstellung wurde erfolgreich gelöscht!',
        variant: 'success',
        isVisible: true
      })

      fetchShowings()
    } catch (error) {
      setToast({
        message: 'Fehler beim Löschen der Vorstellung',
        variant: 'error',
        isVisible: true
      })
      console.error('Fehler beim Löschen:', error)
    }
  }

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
            onClick={() => router.push('/admin/createShowing')}
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
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">Lädt...</div>
              ) : filteredShowings.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {searchTerm ? 'Keine Vorstellungen gefunden' : 'Noch keine Vorstellungen vorhanden'}
                </div>
              ) : (
                filteredShowings.map(showing => (
                  <div 
                    key={showing.id}
                    className="flex items-center justify-between p-4 bg-[#3C3C3C] rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{showing.movie_title}</h3>
                      <p className="text-gray-400">
                        Saal: {showing.hall_name} | Datum: {new Date(showing.start_time).toLocaleDateString()} | 
                        Zeit: {new Date(showing.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
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
                        onClick={() => handleDelete(showing.id)}
                        className="hover:bg-red-500/20 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 