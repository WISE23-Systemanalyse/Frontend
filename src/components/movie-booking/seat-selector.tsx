"use client"

import { useState, useEffect } from "react"
import { Minus, Plus } from 'lucide-react'

interface Seat {
  id: string
  row: number
  col: number
  status: "available" | "taken" | "selected" | "unavailable"
}

export default function SeatSelector() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [seatCount, setSeatCount] = useState(3)

  useEffect(() => {
    setSeats(generateSeats())
  }, [])

  const generateSeats = (): Seat[] => {
    const generatedSeats: Seat[] = []
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const status = Math.random() > 0.3 ? "available" : "taken"
        generatedSeats.push({ id: `seat-${row}-${col}`, row, col, status })
      }
    }
    return generatedSeats
  }

  const toggleSeat = (seatId: string) => {
    setSeats(prevSeats => {
      const seat = prevSeats.find(s => s.id === seatId)
      if (!seat || seat.status !== "available") return prevSeats

      const newSelectedSeats = [...selectedSeats, seatId]
      if (newSelectedSeats.length <= seatCount) {
        setSelectedSeats(newSelectedSeats)
        return prevSeats.map(s => 
          s.id === seatId ? { ...s, status: "selected" } : s
        )
      }
      return prevSeats
    })
  }

  const getStatusColor = (seat: Seat) => {
    switch (seat.status) {
      case "selected": return "bg-red-600"
      case "taken": return "bg-gray-600"
      case "unavailable": return "bg-gray-400"
      default: return "bg-white"
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl mb-4 text-white">Seats</h2>
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button 
            className="text-white" 
            onClick={() => setSeatCount(prev => Math.max(1, prev - 1))}
            disabled={seatCount === 1}
          >
            <Minus className="w-6 h-6" />
          </button>
          <div className="text-red-600 flex items-center">
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 9v6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="ml-2 text-xl">{seatCount}</span>
          </div>
          <button 
            className="text-white" 
            onClick={() => setSeatCount(prev => Math.min(10, prev + 1))}
            disabled={seatCount === 10}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="text-center mb-4 text-sm text-gray-400">Screen</div>
        <div className="grid grid-cols-10 gap-2 mb-8">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => toggleSeat(seat.id)}
              className={`w-8 h-8 rounded ${getStatusColor(seat)} transition-colors duration-200`}
              disabled={seat.status === "taken" || seat.status === "unavailable"}
            />
          ))}
        </div>

        <div className="flex justify-center space-x-8 text-sm mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded" />
            <span className="text-white">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span className="text-white">Taken</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded" />
            <span className="text-white">Your Selection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <span className="text-white">Unavailable</span>
          </div>
        </div>

        <button className="w-full bg-red-600 text-white py-4 rounded text-lg font-medium hover:bg-red-700 transition-colors duration-200">
          Checkout
        </button>
      </div>
    </div>
  )
}

