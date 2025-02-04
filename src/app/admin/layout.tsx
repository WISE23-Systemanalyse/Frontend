'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Film, 
  Users, 
  Calendar,
  LayoutDashboard,
  Sofa,
  BookOpen,
  Armchair,
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path 
      ? 'bg-red-500 text-white' 
      : 'text-gray-400 hover:bg-red-500 hover:text-white'
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <div 
        className={`
          w-16 hover:w-60
          bg-black 
          border-r border-zinc-800
          transition-all 
          duration-300 
          pt-5
          fixed h-full
          group
          z-50
        `}
      >
        {/* Header */}
        <div className="px-4 mb-8 flex items-center">
          <h1 className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Admin
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-0.5 px-2">
          <Link href="/admin" 
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin')}
            `}
          >
            <LayoutDashboard size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Dashboard
            </span>
          </Link>

          <Link href="/admin/movies"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/movies')}
            `}
          >
            <Film size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Filme
            </span>
          </Link>

          <Link href="/admin/halls"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/halls')}
            `}
          >
            <Sofa size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Säle
            </span>
          </Link>

          <Link href="/admin/categories"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/categories')}
            `}
          >
            <Armchair size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Sitzplatzkategorien
            </span>
          </Link>

          <Link href="/admin/shows"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/shows')}
            `}
          >
            <Calendar size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Vorstellungen
            </span>
          </Link>

          <Link href="/admin/users"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/users')}
            `}
          >
            <Users size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Benutzer
            </span>
          </Link>

          <Link href="/admin/booking"
            className={`
              flex items-center
              px-3 py-2 rounded-md
              transition-colors
              ${isActive('/admin/booking')}
            `}
          >
            <BookOpen size={20} className="min-w-[20px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Buchungen
            </span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-16 transition-all duration-300">
        {children}
      </div>
    </div>
  )
} 