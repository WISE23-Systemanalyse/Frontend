"use client"

import Image from 'next/image'
import { Movie } from "@/types/index"

export default function MovieInfo({
  title,
  description,
  duration,
  genres,
  rating,
  imageUrl,
}: Movie) {

  return (
    <div className="bg-black text-white p-4 rounded-lg max-w-sm">
      <div className="relative mb-4 group">
            <Image
              src={imageUrl}
              alt={title}
              className="w-full h-auto rounded-xl"
              layout="responsive"
              width={1}
              height={1}
            />
      </div>

      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      
      <div className="flex items-center gap-2 text-gray-400 mb-3">
        <span className="px-1 py-0.5 bg-gray-800 rounded text-xs">{rating}</span>
        <span>{genres}</span>
        <span>|</span>
        <span>{duration} Min</span>
      </div>

      <p className="text-gray-300 leading-relaxed mb-4">{description}</p>
    </div>
  )
}

