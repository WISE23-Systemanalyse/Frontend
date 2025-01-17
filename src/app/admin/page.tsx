'use client'
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Film, Sofa, Calendar, Users, ArrowRight } from 'lucide-react'

interface DashboardStats {
  activeMovies: number
  totalHalls: number
  todayShows: number
  registeredUsers: number
}

const API_BASE_URL = process.env.BACKEND_URL

const dashboardItems = [
  {
    title: 'Filme',
    description: 'Filme verwalten, hinzufügen und bearbeiten',
    icon: Film,
    color: 'bg-blue-500',
    link: '/admin/movies'
  },
  {
    title: 'Säle',
    description: 'Kinosäle und Sitzplätze verwalten',
    icon: Sofa,
    color: 'bg-emerald-500',
    link: '/admin/halls'
  },
  {
    title: 'Vorstellungen',
    description: 'Filmvorstellungen und Spielzeiten verwalten',
    icon: Calendar,
    color: 'bg-purple-500',
    link: '/admin/shows'
  },
  {
    title: 'Benutzer',
    description: 'Benutzerverwaltung und Berechtigungen',
    icon: Users,
    color: 'bg-amber-500',
    link: '/admin/users'
  }
]

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activeMovies: 0,
    totalHalls: 0,
    todayShows: 0,
    registeredUsers: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Filme abrufen
        let movieCount = 0
        try {
          const moviesRes = await fetch(`${API_BASE_URL}/movies`)
          if (moviesRes.ok) {
            const movies = await moviesRes.json()
            movieCount = Array.isArray(movies) ? movies.length : 0
          }
        } catch (error) {
          console.error('Fehler beim Laden der Filme:', error)
        }

        // Säle abrufen
        let hallCount = 0
        try {
          const hallsRes = await fetch(`${API_BASE_URL}/halls`)
          if (hallsRes.ok) {
            const halls = await hallsRes.json()
            hallCount = Array.isArray(halls) ? halls.length : 0
          }
        } catch (error) {
          console.error('Fehler beim Laden der Säle:', error)
        }

        // Vorstellungen abrufen
        let showCount = 0
        try {
          const showsRes = await fetch(`${API_BASE_URL}/shows`)
          if (showsRes.ok) {
            const shows = await showsRes.json()
            // Filtere nur die Vorstellungen von heute
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Setze Zeit auf Mitternacht
            
            showCount = Array.isArray(shows) 
              ? shows.filter(show => {
                  const showDate = new Date(show.start_time)
                  showDate.setHours(0, 0, 0, 0) // Setze Zeit auf Mitternacht für Vergleich
                  return showDate.getTime() === today.getTime()
                }).length 
              : 0
          }
        } catch (error) {
          console.error('Fehler beim Laden der Vorstellungen:', error)
        }

        // Benutzer abrufen
        let userCount = 0
        try {
          const usersRes = await fetch(`${API_BASE_URL}/users`)
          if (usersRes.ok) {
            const users = await usersRes.json()
            userCount = Array.isArray(users) ? users.length : 0
          }
        } catch (error) {
          console.error('Fehler beim Laden der Benutzer:', error)
        }

        setStats({
          activeMovies: movieCount,
          totalHalls: hallCount,
          todayShows: showCount,
          registeredUsers: userCount
        })
      } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Willkommen im Administrationsbereich</p>
        </div>

        {/* Statistiken nach oben verschoben und neu gestaltet */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Film className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Aktive Filme</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? "..." : stats.activeMovies}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Sofa className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Kinosäle</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? "..." : stats.totalHalls}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Vorstellungen heute</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? "..." : stats.todayShows}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Registrierte Nutzer</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? "..." : stats.registeredUsers}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Hauptnavigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(item.link)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`${item.color} p-3 rounded-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-white group-hover:text-red-500 transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
