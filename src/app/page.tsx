'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

// Dummy data for movies (expanded to demonstrate rotation)
const allMovies = [
  { id: 1, title: "Inception", rating: "12", description: "A thief who enters the dreams of others to steal secrets from their subconscious.", poster: "/inception-poster.jpg", showtimes: ["14:00", "17:30", "21:00"] },
  { id: 2, title: "The Shawshank Redemption", rating: "16", description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", poster: "/shawshank-poster.jpg", showtimes: ["15:30", "19:00", "22:30"] },
  { id: 3, title: "The Dark Knight", rating: "16", description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", poster: "/dark-knight-poster.jpg", showtimes: ["14:30", "18:00", "21:30"] },
  { id: 4, title: "Pulp Fiction", rating: "18", description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", poster: "/pulp-fiction-poster.jpg", showtimes: ["16:00", "19:30", "23:00"] },
  { id: 5, title: "Forrest Gump", rating: "12", description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.", poster: "/forrest-gump-poster.jpg", showtimes: ["13:00", "16:30", "20:00"] },
  { id: 6, title: "The Matrix", rating: "15", description: "A computer programmer discovers that reality as he knows it is a simulation created by machines to subjugate humanity.", poster: "/matrix-poster.jpg", showtimes: ["14:15", "17:45", "21:15"] },
  { id: 7, title: "Goodfellas", rating: "18", description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.", poster: "/goodfellas-poster.jpg", showtimes: ["15:00", "18:30", "22:00"] },
  { id: 8, title: "The Silence of the Lambs", rating: "18", description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.", poster: "/silence-of-the-lambs-poster.jpg", showtimes: ["16:15", "19:45", "23:15"] },
]

// Dummy data for upcoming movies
const upcomingMovies = [
  { id: 1, title: "Dune: Part Two", poster: "/dune-2-poster.jpg", releaseDate: "March 1, 2024" },
  { id: 2, title: "The Batman 2", poster: "/batman-2-poster.jpg", releaseDate: "October 3, 2025" },
  { id: 3, title: "Oppenheimer", poster: "/oppenheimer-poster.jpg", releaseDate: "July 21, 2023" },
]

// Dummy data for events
const allEvents = [
  { id: 1, title: "Film Festival Opening Night", date: "July 15, 2023", description: "Join us for the grand opening of our annual film festival, featuring exclusive screenings and special guests." },
  { id: 2, title: "Director's Cut: Quentin Tarantino", date: "August 5, 2023", description: "A special screening of Pulp Fiction with a Q&A session with the legendary director himself." },
  { id: 3, title: "Marvel Movie Marathon", date: "September 2, 2023", description: "Experience the entire Marvel Cinematic Universe in one epic day-long event." },
  { id: 4, title: "Silent Film Night", date: "October 10, 2023", description: "Step back in time with a curated selection of classic silent films, accompanied by a live orchestra." },
  { id: 5, title: "Oscar Nominees Showcase", date: "January 20, 2024", description: "Watch all the Best Picture nominees before the big award night." },
  { id: 6, title: "Sci-Fi Spectacular", date: "March 15, 2024", description: "A weekend dedicated to the best of science fiction cinema, from classics to modern masterpieces." },
]

export default function Home() {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const nextMovie = () => {
    setCurrentMovieIndex((prevIndex) => (prevIndex + 1) % allMovies.length);
  };

  const prevMovie = () => {
    setCurrentMovieIndex((prevIndex) => (prevIndex - 1 + allMovies.length) % allMovies.length);
  };

  const nextEvent = () => {
    setCurrentEventIndex((prevIndex) => (prevIndex + 1) % allEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prevIndex) => (prevIndex - 1 + allEvents.length) % allEvents.length);
  };

  const currentMovies = Array.from({ length: 4 }, (_, i) => 
    allMovies[(currentMovieIndex + i) % allMovies.length]
  );

  const currentEvents = Array.from({ length: 3 }, (_, i) => 
    allEvents[(currentEventIndex + i) % allEvents.length]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto pt-16 pb-8">
        {/* Current movies section */}
        <section className="mb-12 relative">
          <h2 className="text-3xl font-bold mb-6">Current Movies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300 ease-in-out">
            {currentMovies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out transform hover:scale-105">
                <div className="p-4">
                  <Image src={movie.poster} alt={movie.title} width={300} height={450} className="w-full h-auto rounded-t-lg" />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl mb-2">{movie.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Rating: {movie.rating}</p>
                  <p className="text-sm mb-4 flex-grow">{movie.description}</p>
                  <div className="bg-gray-100 p-2 rounded mt-auto">
                    <h4 className="font-semibold mb-1">Today&apos;s Showtimes</h4>
                    <div className="flex flex-wrap gap-2">
                      {movie.showtimes.map((time, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={prevMovie} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-r-lg p-2 shadow-md"
            aria-label="Previous movie"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button 
            onClick={nextMovie} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-l-lg p-2 shadow-md"
            aria-label="Next movie"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </section>

        {/* Events section */}
        <section className="mb-12 relative">
          <h2 className="text-2xl font-bold mb-4">Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ease-in-out">
            {currentEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105">
                <div className="p-4 flex flex-col h-40">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {event.date}
                  </p>
                  <p className="text-sm flex-grow overflow-hidden">{event.description}</p>
                </div>
                <div className="p-4 bg-gray-50 mt-auto">
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={prevEvent} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-r-lg p-2 shadow-md"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button 
            onClick={nextEvent} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-l-lg p-2 shadow-md"
            aria-label="Next event"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </section>

        {/* Upcoming highlights */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingMovies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image src={movie.poster} alt={movie.title} width={300} height={450} className="w-full h-auto" />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{movie.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {movie.releaseDate}
                  </p>
                </div>
                <div className="p-4 bg-gray-50">
                  <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                    Watch Trailer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

