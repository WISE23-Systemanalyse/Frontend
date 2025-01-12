"use client";
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const footerLinks = [
  { title: 'Company', links: ['About Us', 'Careers', 'Contact Us', 'Press'] },
  { title: 'Movies', links: ['Now Showing', 'Coming Soon', 'Trailers', 'Genres'] },
  { title: 'Services', links: ['Gift Cards', 'Mobile App', 'Corporate Events', 'Advertise'] },
  { title: 'Help', links: ['FAQs', 'Terms of Use', 'Privacy Policy', 'Accessibility'] },
]

const socialLinks = [
  { icon: Facebook, href: '#1' },
  { icon: Twitter, href: '#2' },
  { icon: Instagram, href: '#3' },
  { icon: Youtube, href: '#4' },
]

export default function Footer() {
  return (
    <footer className="bg-black text-red-400">
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
                      <li key={link}>
                        <Link 
                          href="#" 
                          className="text-base text-white hover:text-red-500 transition-colors duration-200"
                        >
                          {link}
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
                      <li key={link}>
                        <Link 
                          href="#" 
                          className="text-base text-white hover:text-red-500 transition-colors duration-200"
                        >
                          {link}
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
              Subscribe to our newsletter
            </h3>
            <p className="mt-4 text-base text-white">
              Get the latest updates on new releases, special promotions, and movie news.
            </p>
            <form className="mt-4 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="block w-full pl-3 pr-3 py-2 rounded-md leading-5 bg-[#3C3C3C] text-white placeholder-gray-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 focus-visible:ring-0 border-0 focus:border-0 sm:text-sm"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Subscribe
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

