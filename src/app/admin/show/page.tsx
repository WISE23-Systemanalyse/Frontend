"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Statische Datensätze für Filme und Säle
const movies = [
  { id: '1', title: 'Inception' },
  { id: '2', title: 'The Dark Knight' },
  { id: '3', title: 'Interstellar' },
  { id: '4', title: 'The Matrix' },
  { id: '5', title: 'Pulp Fiction' },
]

const theaters = [
  { id: '1', name: 'Saal 1', capacity: 100 },
  { id: '2', name: 'Saal 2', capacity: 80 },
  { id: '3', name: 'Saal 3', capacity: 120 },
  { id: '4', name: 'VIP Saal', capacity: 50 },
]

export default function CreateScreening() {
  const [screening, setScreening] = useState({
    movieId: '',
    theaterId: '',
    date: '',
    time: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setScreening(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hier würden Sie normalerweise die Daten an Ihr Backend senden
    console.log('Neue Vorstellung:', screening)
    // Formular zurücksetzen
    setScreening({
      movieId: '',
      theaterId: '',
      date: '',
      time: ''
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Neue Vorstellung anlegen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DropdownMenu>Film</DropdownMenu>
            <select
              id="movieId"
              name="movieId"
              value={screening.movieId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Wähle einen Film</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <DropdownMenu>Saal</DropdownMenu>
            <select
              id="theaterId"
              name="theaterId"
              value={screening.theaterId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Wähle einen Saal</option>
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.name} (Kapazität: {theater.capacity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <DropdownMenu>Datum</DropdownMenu>
            <Input
              id="date"
              name="date"
              type="date"
              value={screening.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <DropdownMenu>Uhrzeit</DropdownMenu>
            <Input
              id="time"
              name="time"
              type="time"
              value={screening.time}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">Vorstellung anlegen</Button>
        </form>
      </CardContent>
    </Card>
  )
}

