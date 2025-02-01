'use client'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserCog, Trash2 } from "lucide-react"
import { fetchUsers, deleteUser } from './fetchdata'
import Image from 'next/image'
import { Modal } from "@/components/ui/modal"

interface User {
  id: number
  email: string
  userName: string
  firstName: string
  lastName: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
  imageUrl?: string
  isAdmin: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers()
        setUsers(data)
        setFilteredUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [searchTerm] )

  // Filter users based on search
  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return

    try {
      await deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    }
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

  const UserDetailsModal = ({ user }: { user: User }) => {
    return (
      <div className="p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-600">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.userName || user.email}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-600 text-white text-3xl font-medium">
                {(user.userName || user.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.userName || 'Kein Benutzername'}
            </h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Persönliche Informationen</h3>
            <div className="bg-neutral-700/50 rounded-lg p-4 space-y-1 h-[180px]">
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Vorname:</span>
                <span className="text-white ml-4">{user.firstName || '-'}</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Nachname:</span>
                <span className="text-white ml-4">{user.lastName || '-'}</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Rolle:</span>
                <span className="text-white ml-4">{user.isAdmin ? 'Administrator' : 'Benutzer'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Konto-Details</h3>
            <div className="bg-neutral-700/50 rounded-lg p-4 space-y-1 h-[180px]">
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Benutzer-ID:</span>
                <span className="text-white ml-4">{user.id}</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Erstellt am:</span>
                <span className="text-white ml-4">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-gray-400">Zuletzt aktualisiert:</span>
                <span className="text-white ml-4">{formatDate(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleDeleteUser(user.id)}
          className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 
                   transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Benutzer löschen
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Benutzerverwaltung</h1>
          </div>
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Suche nach E-Mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 text-white border-0 focus:ring-1 
                       focus:ring-red-500 h-10 rounded-lg"
            />
          </div>
        </div>

        {/* Users List */}
        <Card className="bg-neutral-800 border-0">
          <div className="p-6">
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id}>
                  <div
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    className="flex items-center justify-between p-4 bg-neutral-700/50 
                             rounded-lg hover:bg-neutral-700/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-600 flex-shrink-0">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={user.userName || user.email}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-600 text-white text-lg font-medium">
                            {(user.userName || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {user.userName || 'Kein Benutzername'}
                        </span>
                        <span className="text-sm text-gray-400">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-gray-400">
                        {user.isAdmin ? 'Administrator' : 'Benutzer'}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 
                                 hover:bg-red-400/10 rounded-full"
                        title="Benutzer löschen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Keine Benutzer gefunden
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        >
          <UserDetailsModal user={selectedUser} />
        </Modal>
      )}
    </div>
  )
}
