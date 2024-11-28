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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{column.title}</h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {column.links.map((link) => (
                      <li key={link}>
                        <Link href="#" className="text-base hover:text-white">
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
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{column.title}</h3>
                  <ul role="list" className="mt-4 space-y-4">
                    {column.links.map((link) => (
                      <li key={link}>
                        <Link href="#" className="text-base hover:text-white">
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
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Subscribe to our newsletter
            </h3>
            <p className="mt-4 text-base text-gray-300">
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
                className="w-full min-w-0 px-4 py-2 text-base text-gray-900 placeholder-gray-500 bg-white border border-transparent rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white focus:placeholder-gray-400"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {socialLinks.map((item) => (
              <Link key={item.icon.name + item.href} href={item.href} className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">{item.icon.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} CinemaPlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

