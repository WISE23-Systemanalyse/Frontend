'use client'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { fetchShows } from './fetchdata'

interface Show {
  id: number
  movie_id: number
  hall_id: number
  start_time: string
}

export default function ShowList(){
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShows({ setIsLoading, setShows, setError });
  }, []);
      

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Aktuelle Vorstellungen</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((showtime) => (
          <Card key={showtime.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{showtime.movie_id}</CardTitle>
              <CardDescription>Saal:: {showtime.hall_id}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm">
                <span className="font-semibold">Vorstellung:</span> {showtime.id}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Startzeit:</span> {showtime.start_time}
              </p>
            </CardContent>
            <CardFooter>
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md">
                Tickets buchen
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}



// import { useEffect, useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { getUpcomingScreenings, Screening } from '@/components/ui/screenings'
// import Image from 'next/image'
// import { Calendar, Clock, Users } from 'lucide-react'

// export default function Screenings() {
//   const [screenings, setScreenings] = useState<Screening[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     async function fetchScreenings() {
//       try {
//         const data = await getUpcomingScreenings()
//         setScreenings(data)
//       } catch (error) {
//         console.error('Fehler beim Laden der Vorstellungen:', error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchScreenings()
//   }, [])

//   return (
//     <div className='flex h-screen w-screen p-4 gap-4'>
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Zukünftige Vorstellungen</h1>
//       {isLoading ? (
//         <p className="text-center">Lade Vorstellungen...</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {screenings.map((screening) => (
//             <Card key={screening.id} className="overflow-hidden">
//               <div className="relative h-48">
//                 <Image
//                   src={screening.imageUrl}
//                   alt={screening.movieTitle}
//                   layout="fill"
//                   objectFit="cover"
//                 />
//               </div>
//               <CardHeader>
//                 <CardTitle>{screening.movieTitle}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex items-center">
//                     <Calendar className="mr-2 h-4 w-4" />
//                     <span>{screening.date}</span>
//                   </div>
//                   <div className="flex items-center">
//                     <Clock className="mr-2 h-4 w-4" />
//                     <span>{screening.time}</span>
//                   </div>
//                   <div className="flex items-center">
//                     <Users className="mr-2 h-4 w-4" />
//                     <span>{screening.availableSeats} verfügbare Plätze</span>
//                   </div>
//                   <div className="mt-2">
//                     <span className="font-semibold">Saal:</span> {screening.theater}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//     </div>
//   )
// }

