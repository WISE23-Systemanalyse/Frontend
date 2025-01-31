"use client";
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Film, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAuthSignOut } from '@/providers/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { name: 'Filme', href: '/' },
  { name: 'Programm', href: '/programm' },
  { name: 'Über uns', href: '/about' },
  { name: 'Kontakt', href: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { data: session } = useSession()
  const handleSignOut = useAuthSignOut()

  const profileItems = session ? [
    { name: 'Profil', href: '/profile', onClick: undefined },
    { name: 'Ausloggen', href: '#', onClick: handleSignOut }
  ] : [
    { name: 'Anmelden', href: '/auth/signin', onClick: undefined }
  ]

  return (
    <nav className="bg-black text-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Film className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-red-600">CinemaPlus</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    pathname === item.href
                      ? 'border-red-500 text-red-500'
                      : 'border-transparent text-white hover:border-red-500 hover:text-red-500'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex text-sm rounded-full text-white hover:bg-red-500/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Benutzermenü öffnen</span>
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border border-zinc-800">
                  {profileItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.name}
                      className="hover:bg-red-500/10 focus:bg-red-500/10"
                      onClick={item.onClick}
                    >
                      {item.onClick ? (
                        <span className="w-full text-white cursor-pointer">
                          {item.name}
                        </span>
                      ) : (
                        <Link href={item.href} className="w-full text-white">
                          {item.name}
                        </Link>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Hauptmenü öffnen</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('sm:hidden', isMobileMenuOpen ? 'block' : 'hidden')}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block px-3 py-2 text-base font-medium border-l-4',
                pathname === item.href
                  ? 'border-red-500 text-red-500 bg-red-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile profile menu */}
        <div className="pt-4 pb-3 border-t border-zinc-800">
          <div className="space-y-1">
            {profileItems.map((item) => (
              <div
                key={item.name}
                onClick={item.onClick}
                className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-red-500/10 cursor-pointer"
              >
                {item.onClick ? (
                  <span>{item.name}</span>
                ) : (
                  <Link href={item.href}>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
