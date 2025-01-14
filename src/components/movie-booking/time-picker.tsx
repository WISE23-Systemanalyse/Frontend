"use client"

import { useState } from "react"

interface TimeSlot {
  time: string
  theater: string
  format?: string
}

const timeSlots: TimeSlot[] = [
  { time: "16:30", theater: "Theater 5" },
  { time: "18:30", theater: "Theater 6", format: "RealD 3D" },
  { time: "20:30", theater: "Theater 5" },
  { time: "22:30", theater: "Theater 6", format: "RealD 3D" },
  { time: "22:30", theater: "Theater 5" },
]

export default function TimePicker() {
  const [selectedTime, setSelectedTime] = useState("")

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4 text-center text-white">Time</h2>
      <div className="flex justify-center space-x-4">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => setSelectedTime(slot.time + slot.theater)}
            className={`text-center p-4 ${
              selectedTime === slot.time + slot.theater
                ? "text-red-600 border-b-2 border-red-600"
                : "text-white"
            }`}
          >
            <div className="text-xl">{slot.time}</div>
            <div className="text-sm text-gray-400">{slot.theater}</div>
            {slot.format && (
              <div className="text-xs text-gray-500">{slot.format}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

