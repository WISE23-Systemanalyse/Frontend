'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Minus, Armchair, Crown, Square } from 'lucide-react'

interface Seat {
  id: number
  hall_id: number
  row_number: number
  seat_number: number
  seat_type: string
}

interface SeatEditorProps {
  seats: Seat[]
  onChange: (seats: Seat[]) => void
  hallId: number
}

const API_BASE_URL = process.env.BACKEND_URL

// Konstanten für die maximalen Werte
const MAX_ROWS = 15
const MAX_SEATS_PER_ROW = 20

const SEAT_TYPE = {
  NONE: 'NONE',      // Kein Sitz/Gang
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  VIP: 'VIP'
} as const

export function SeatEditor({ seats, onChange, hallId }: SeatEditorProps) {
  const [rows, setRows] = useState(5)
  const [seatsPerRow, setSeatsPerRow] = useState(15)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SEAT_TYPE>(SEAT_TYPE.STANDARD)
  const [isDrawing, setIsDrawing] = useState(false)
  const [noneSeats, setNoneSeats] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (hallId === 0 && !isInitialized) {
      // Initialisierung für einen neuen Saal
      const initialSeats: Seat[] = []
      let nextId = -1

      for (let row = 1; row <= rows; row++) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          initialSeats.push({
            id: nextId--,
            hall_id: hallId,
            row_number: row,
            seat_number: seatNum,
            seat_type: SEAT_TYPE.STANDARD
          })
        }
      }

      onChange(initialSeats)
      setIsInitialized(true)
    } else if (hallId !== 0) {
      // Lade existierende Sitze für bestehende Säle
      loadExistingSeats()
    }
  }, [hallId])

  const loadExistingSeats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/seats`)
      if (!response.ok) throw new Error('Sitze konnten nicht geladen werden')
      const data = await response.json()
      
      const hallSeats = data.filter((seat: Seat) => seat.hall_id === hallId)
      
      if (hallSeats.length > 0) {
        const maxRow = Math.max(...hallSeats.map((seat: Seat) => seat.row_number))
        const maxSeatsInRow = Math.max(...hallSeats.map((seat: Seat) => seat.seat_number))
        setRows(maxRow)
        setSeatsPerRow(maxSeatsInRow)

        // Initialisiere die "Keine Sitze" Set mit allen möglichen Positionen
        const nonePositions = new Set<string>()
        
        // Füge zuerst alle möglichen Positionen als "Keine Sitze" hinzu
        for (let row = 1; row <= maxRow; row++) {
          for (let seat = 1; seat <= maxSeatsInRow; seat++) {
            nonePositions.add(`${row}-${seat}`)
          }
        }

        // Entferne dann die Positionen, an denen tatsächlich Sitze sind
        hallSeats.forEach((seat: Seat) => {
          if (seat.seat_type !== SEAT_TYPE.NONE) {
            nonePositions.delete(`${seat.row_number}-${seat.seat_number}`)
          }
        })

        setNoneSeats(nonePositions)
      }

      // Filtere NONE-Sitze aus der Liste heraus
      onChange(hallSeats.filter((seat: Seat) => seat.seat_type !== SEAT_TYPE.NONE))
    } catch (error) {
      console.error('Fehler beim Laden der Sitze:', error)
    }
  }

  const updateSeats = (newRows: number, newSeatsPerRow: number) => {
    const existingSeats = [...seats]
    const newSeats: Seat[] = []
    let nextId = Date.now()

    if (existingSeats.length > 0) {
      nextId = Math.max(...existingSeats.map(seat => seat.id)) + 1
    }

    // Erstelle eine Map für existierende Sitze
    const seatMap = new Map(
      existingSeats.map(seat => [
        `${seat.row_number}-${seat.seat_number}`,
        seat
      ])
    )

    // Behalte die alten "Keine Sitze" für die neuen Dimensionen
    const updatedNoneSeats = new Set<string>()
    noneSeats.forEach(key => {
      const [row, seat] = key.split('-').map(Number)
      if (row <= newRows && seat <= newSeatsPerRow) {
        updatedNoneSeats.add(key)
      }
    })

    // Erstelle neue Sitze, aber überspringe "Keine Sitze" Positionen
    for (let row = 1; row <= newRows; row++) {
      for (let seatNum = 1; seatNum <= newSeatsPerRow; seatNum++) {
        const key = `${row}-${seatNum}`
        const existingSeat = seatMap.get(key)

        if (existingSeat) {
          newSeats.push(existingSeat)
        } else if (!updatedNoneSeats.has(key)) {
          newSeats.push({
            id: nextId++,
            hall_id: hallId,
            row_number: row,
            seat_number: seatNum,
            seat_type: SEAT_TYPE.STANDARD
          })
        }
      }
    }

    setNoneSeats(updatedNoneSeats)
    onChange(newSeats)
  }

  const updateRows = (newRows: number) => {
    // Stelle sicher, dass wir innerhalb der Grenzen bleiben
    const validRows = Math.max(1, Math.min(MAX_ROWS, newRows))
    setRows(validRows)
    updateSeats(validRows, seatsPerRow)
  }

  const updateSeatsPerRow = (newSeatsPerRow: number) => {
    // Stelle sicher, dass wir innerhalb der Grenzen bleiben
    const validSeats = Math.max(1, Math.min(MAX_SEATS_PER_ROW, newSeatsPerRow))
    setSeatsPerRow(validSeats)
    updateSeats(rows, validSeats)
  }

  const handleSeatUpdate = (row: number, seatNum: number) => {
    const key = `${row}-${seatNum}`

    if (selectedCategory === SEAT_TYPE.NONE) {
      // Füge Position zu "Keine Sitze" hinzu
      const newNoneSeats = new Set(noneSeats)
      newNoneSeats.add(key)
      setNoneSeats(newNoneSeats)
      
      // Entferne den Sitz aus der Liste
      onChange(seats.filter(s => 
        !(s.row_number === row && s.seat_number === seatNum)
      ))
    } else {
      // Entferne Position aus "Keine Sitze"
      const newNoneSeats = new Set(noneSeats)
      newNoneSeats.delete(key)
      setNoneSeats(newNoneSeats)

      // Füge Sitz hinzu oder aktualisiere ihn
      const existingSeat = seats.find(s => 
        s.row_number === row && s.seat_number === seatNum
      )

      if (existingSeat) {
        onChange(seats.map(s => {
          if (s.row_number === row && s.seat_number === seatNum) {
            return { ...s, seat_type: selectedCategory }
          }
          return s
        }))
      } else {
        onChange([...seats, {
          id: Date.now(),
          hall_id: hallId,
          row_number: row,
          seat_number: seatNum,
          seat_type: selectedCategory
        }])
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-8">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Reihen:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateRows(rows - 1)}
              disabled={rows <= 1}
              className="bg-[#3C3C3C] hover:bg-[#4C4C4C] border-0"
            >
              <Minus className="h-4 w-4 text-gray-400" />
            </Button>
            <span className="w-8 text-center text-gray-400">{rows}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateRows(rows + 1)}
              disabled={rows >= MAX_ROWS}
              className="bg-[#3C3C3C] hover:bg-[#4C4C4C] border-0"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400">Sitze pro Reihe:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateSeatsPerRow(seatsPerRow - 1)}
              disabled={seatsPerRow <= 1}
              className="bg-[#3C3C3C] hover:bg-[#4C4C4C] border-0"
            >
              <Minus className="h-4 w-4 text-gray-400" />
            </Button>
            <span className="w-8 text-center text-gray-400">{seatsPerRow}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateSeatsPerRow(seatsPerRow + 1)}
              disabled={seatsPerRow >= MAX_SEATS_PER_ROW}
              className="bg-[#3C3C3C] hover:bg-[#4C4C4C] border-0"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setSelectedCategory(SEAT_TYPE.NONE)}
          className={`flex-1 ${
            selectedCategory === SEAT_TYPE.NONE
              ? 'bg-[#141414] hover:bg-[#1C1C1C]'
              : 'bg-[#3C3C3C] hover:bg-[#4C4C4C]'
          } text-white`}
        >
          Kein Sitz
        </Button>
        <Button
          onClick={() => setSelectedCategory(SEAT_TYPE.STANDARD)}
          className={`flex-1 ${
            selectedCategory === SEAT_TYPE.STANDARD
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-[#3C3C3C] hover:bg-[#4C4C4C]'
          } text-white flex items-center justify-center gap-2`}
        >
          <Square size={12} className="text-white" />
          Standard
        </Button>
        <Button
          onClick={() => setSelectedCategory(SEAT_TYPE.PREMIUM)}
          className={`flex-1 ${
            selectedCategory === SEAT_TYPE.PREMIUM
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-[#3C3C3C] hover:bg-[#4C4C4C]'
          } text-white flex items-center justify-center gap-2`}
        >
          <Armchair size={14} className="text-white" />
          Premium
        </Button>
        <Button
          onClick={() => setSelectedCategory(SEAT_TYPE.VIP)}
          className={`flex-1 ${
            selectedCategory === SEAT_TYPE.VIP
              ? 'bg-purple-600 hover:bg-purple-500'
              : 'bg-[#3C3C3C] hover:bg-[#4C4C4C]'
          } text-white flex items-center justify-center gap-2`}
        >
          <Crown size={14} className="text-white" />
          VIP
        </Button>
      </div>

      <div className="relative">
        <div className="relative mb-6">
          <div className="w-full h-8 bg-red-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              LEINWAND
            </span>
          </div>
        </div>

        <div className="flex justify-between mb-2 px-1">
          {Array.from({ length: seatsPerRow }).map((_, i) => (
            <span key={i} className="text-xs text-neutral-500 w-8 text-center">
              {i + 1}
            </span>
          ))}
        </div>

        <div className="flex">
          <div className="flex flex-col justify-between pr-2 py-1">
            {Array.from({ length: rows }).map((_, i) => (
              <span key={i} className="text-xs text-neutral-500 h-8 flex items-center">
                {i + 1}
              </span>
            ))}
          </div>

          <div 
            className="grid gap-2 flex-1" 
            style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}
            onMouseLeave={() => setIsDrawing(false)}
          >
            {Array.from({ length: rows * seatsPerRow }).map((_, index) => {
              const row = Math.floor(index / seatsPerRow) + 1
              const seatNum = (index % seatsPerRow) + 1
              const key = `${row}-${seatNum}`
              const seat = seats.find(s => s.row_number === row && s.seat_number === seatNum)
              const isNoneSeat = noneSeats.has(key)

              return (
                <button
                  key={index}
                  onMouseDown={() => {
                    setIsDrawing(true)
                    handleSeatUpdate(row, seatNum)
                  }}
                  onMouseEnter={() => {
                    if (isDrawing) {
                      handleSeatUpdate(row, seatNum)
                    }
                  }}
                  onMouseUp={() => setIsDrawing(false)}
                  className={`
                    aspect-square rounded-md transition-colors flex items-center justify-center
                    ${isNoneSeat ? 'opacity-10 hover:opacity-25' : ''}
                    ${seat?.seat_type === SEAT_TYPE.STANDARD ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
                    ${seat?.seat_type === SEAT_TYPE.PREMIUM ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    ${seat?.seat_type === SEAT_TYPE.VIP ? 'bg-purple-600 hover:bg-purple-500' : ''}
                  `}
                  title={seat 
                    ? `Reihe ${row}, Sitz ${seatNum} (${seat.seat_type})`
                    : `Reihe ${row}, Sitz ${seatNum} (Kein Sitz)`
                  }
                >
                  {seat?.seat_type === SEAT_TYPE.STANDARD && <Square size={12} className="text-white" />}
                  {seat?.seat_type === SEAT_TYPE.PREMIUM && <Armchair size={14} className="text-white" />}
                  {seat?.seat_type === SEAT_TYPE.VIP && <Crown size={14} className="text-white" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-6 justify-center mt-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Square size={12} className="text-white" />
            </div>
            <span className="text-gray-400">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Armchair size={14} className="text-white" />
            </div>
            <span className="text-gray-400">Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <Crown size={14} className="text-white" />
            </div>
            <span className="text-gray-400">VIP</span>
          </div>
        </div>
      </div>
    </div>
  )
} 