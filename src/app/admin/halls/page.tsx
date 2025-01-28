'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Hall {
  id: number
  name: string
  seating_capacity: number
}

const API_BASE_URL = process.env.BACKEND_URL

export default function HallsOverview() {
  const router = useRouter()
  const [halls, setHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    hallId: ''
  })

  useEffect(() => {
    fetchHalls()
  }, [])

  const fetchHalls = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/halls`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHalls(data)
    } catch (err) {
      console.error('Fehler beim Laden der Säle:', err)
      setError('Säle konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDialog({ isOpen: true, hallId: id })
  }

  const confirmDelete = async () => {
    const id = parseInt(confirmDialog.hallId)
    try {
      setToast({
        message: 'Saal wird gelöscht...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`${API_BASE_URL}/halls/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Saal konnte nicht gelöscht werden')
      
      setHalls(prevHalls => prevHalls.filter(hall => hall.id !== id))
      
      setToast({
        message: 'Saal wurde erfolgreich gelöscht!',
        variant: 'success',
        isVisible: true
      })

      setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    } catch (error) {
      setToast({
        message: 'Saal konnte nicht gelöscht werden',
        variant: 'error',
        isVisible: true
      })
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Saal löschen"
        message="Möchten Sie diesen Saal wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Saalverwaltung</h1>
          <Link href="/admin/createHall">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Neuen Saal anlegen
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-white text-center py-8">Lade Säle...</div>
        ) : error ? (
          <div className="bg-[#2C2C2C] p-4 rounded text-red-500">
            {error}
          </div>
        ) : halls.length === 0 ? (
          <div className="text-white text-center py-8">
            Keine Säle gefunden
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map(hall => (
              <div 
                key={hall.id} 
                className="bg-[#2C2C2C] rounded-lg p-6 hover:bg-[#3C3C3C] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{hall.name}</h2>
                    <p className="text-gray-400">
                      Kapazität: {hall.seating_capacity} Sitze
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => router.push(`/admin/editHall/${hall.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Bearbeiten
                  </Button>
                  <Button 
                    onClick={() => handleDelete(hall.id.toString())}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 