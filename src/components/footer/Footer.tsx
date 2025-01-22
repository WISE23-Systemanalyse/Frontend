"use client";
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Toast } from "@/components/ui/toast"

const footerLinks = [
  { 
    title: 'Unternehmen', 
    links: [
      { name: 'Über uns', href: '/about' },
      { name: 'Karriere', href: '#' },
      { name: 'Kontakt', href: '/contact' },
      { name: 'Impressum', href: '/impressum' },
    ] 
  },
  { 
    title: 'Filme', 
    links: [
      { name: 'Aktuell', href: '#' },
      { name: 'Demnächst', href: '#' },
      { name: 'Trailer', href: '#' },
      { name: 'Genres', href: '#' },
    ]
  },
  { 
    title: 'Service', 
    links: [
      { name: 'Gutscheine', href: '#' },
      { name: 'Mobile App', href: '#' },
      { name: 'Firmenevents', href: '#' },
      { name: 'Werbung', href: '#' },
    ]
  },
  { 
    title: 'Hilfe', 
    links: [
      { name: 'FAQ', href: '#' },
      { name: 'AGB', href: '/agb' },
      { name: 'Datenschutz', href: '#' },
      { name: 'Barrierefreiheit', href: '#' },
    ]
  },
]

const socialLinks = [
  { icon: Facebook, href: '#1' },
  { icon: Twitter, href: '#2' },
  { icon: Instagram, href: '#3' },
  { icon: Youtube, href: '#4' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setToast({
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        variant: 'error',
        isVisible: true
      })
      return
    }

    try {
      setIsLoading(true)
      setToast({
        message: 'Newsletter-Anmeldung wird verarbeitet...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`http://localhost:8000/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Newsletter-Anmeldung fehlgeschlagen')
      }

      setToast({
        message: 'Erfolgreich zum Newsletter angemeldet!',
        variant: 'success',
        isVisible: true
      })
      setEmail('')
    } catch (error) {
      setToast({
        message: 'Newsletter-Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.'+ error,
        variant: 'error',
        isVisible: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-black text-red-400">
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold text-red-500 tracking-wider uppercase">
                    {column.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href} 
                          className="text-base text-white hover:text-red-500 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(2).map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold text-red-500 tracking-wider uppercase">
                    {column.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href} 
                          className="text-base text-white hover:text-red-500 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 xl:mt-0">
            <h3 className="text-sm font-semibold text-red-500 tracking-wider uppercase">
              Newsletter abonnieren
            </h3>
            <p className="mt-4 text-base text-white">
              Erhalten Sie die neuesten Updates zu Filmstarts, Sonderaktionen und Kino-News.
            </p>
            <form 
              onSubmit={handleSubscribe} 
              method="POST"
              className="mt-4 sm:flex sm:max-w-md"
            >
              <label htmlFor="email-address" className="sr-only">
                E-Mail-Adresse
              </label>
              <Input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 rounded-md leading-5 bg-[#3C3C3C] text-white placeholder-gray-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0 border-0 focus:border-0 sm:text-sm"
                placeholder="Ihre E-Mail-Adresse"
                disabled={isLoading}
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Wird verarbeitet...' : 'Abonnieren'}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-red-900/20 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {socialLinks.map((item) => (
              <Link 
                key={item.icon.name + item.href} 
                href={item.href} 
                className="text-red-400 hover:text-red-500 transition-colors duration-200"
              >
                <span className="sr-only">{item.icon.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="mt-8 text-base text-red-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} CinemaPlus. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}

