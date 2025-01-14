"use client"
import { useState } from "react"
import { Show } from "@/types/index"

interface TimePickerProps {
  shows: Show[]
  selectedDate: number
  selectedMonth: string
  onShowSelect: (showId: number, hallId: number) => void
  selectedShowId?: number
}

export default function TimePicker({
  shows,
  selectedDate,
  selectedMonth,
  onShowSelect,
  selectedShowId
}: TimePickerProps) {
  // Filter shows for selected date and format them
  const getShowsForDate = () => {
    return shows
      .filter(show => {
        const showDate = new Date(show.start_time)
        return (
          showDate.getDate() === selectedDate &&
          showDate.toLocaleString('de-DE', { month: 'long' }) === selectedMonth
        )
      })
      .map(show => ({
        id: show.id,
        time: new Date(show.start_time).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        hall_id: show.hall_id,
        hall_name: `Saal ${show.hall_id}`,
        format: '2D' // You can make this dynamic if needed
      }))
  }

  const availableShows = getShowsForDate()

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4 text-center text-white">Time</h2>
      <div className="flex justify-center space-x-4">
        {availableShows.length === 0 ? (
          <div className="text-white">Keine Vorstellungen an dem Tag</div>
        ) : (
          availableShows.map((show, index) => (
            <button
              key={index}
              onClick={() => onShowSelect(show.id, show.hall_id)}
              className={`text-center p-4 ${
                selectedShowId === show.id
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-white"
              }`}
            >
              <div className="text-xl">{show.time}</div>
              <div className="text-sm text-gray-400">{show.hall_name}</div>
              {show.format && (
                <div className="text-xs text-gray-500">{show.format}</div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}