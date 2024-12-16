'use client'
import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Movie } from "@/types/movie"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://api.kts.testcode.tools/movies")
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch movies')
        }
        return response.json()
      })
      .then((data) => {
        setMovies(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Movie Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Card key={movie.id} className="flex flex-col">
            <CardContent className="p-4">
              <Image
                src={""}
                alt={movie.title}
                width={300}
                height={450}
                className="w-full h-[300px] object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
              <p className="text-gray-600">{movie.year}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Link href={`/movies/${movie.id}`} passHref>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

