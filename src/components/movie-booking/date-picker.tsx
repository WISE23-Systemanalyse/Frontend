"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DatePicker() {
  const [selectedDate, setSelectedDate] = useState(5)
  
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center items-center mb-4">
        <Select>
            <SelectTrigger className="flex items-center text-2xl mb-4 text-center text-white w-[180px] border-none bg-inherit">
            <SelectValue placeholder={new Date().toLocaleString('de-DE', { month: 'long' })} className="text-center"/>
            </SelectTrigger>
          <SelectContent className='flex items-center justify-center space-x-4'>
            <SelectGroup>
              {["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"].map((month, index) => (
            <SelectItem key={month} value={month} className="text-center">
            {month}
            </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center items-center mb-4"></div>
      <div className="flex items-center justify-center space-x-6">
        <button className="text-white hover:text-red-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        {Array.from({ length: 5 }, (_, i) => selectedDate - 2 + i).map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedDate === date
          ? "text-red-600 border-b-2 border-red-600"
          : "text-white"
            }`}
          >
            {date}
          </button>
        ))}
        <button className="text-white hover:text-red-600">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

