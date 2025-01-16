'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { fetchShows } from './fetchdata'
import Image from 'next/image'

interface Show {
    id: number;
    movie_id: number;
    hall_id: number;
    start_time: string;
    title: string;
    description: string;
    image_url: string;
    name: string;
}

export default function ShowList(){
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shows nach Datum filtern
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const todayShows = shows.filter(show => {
    const showDate = new Date(show.start_time);
    showDate.setHours(0, 0, 0, 0);
    return showDate.getTime() === today.getTime();
  });

  const futureShows = shows.filter(show => {
    const showDate = new Date(show.start_time);
    showDate.setHours(0, 0, 0, 0);
    const showDateTimestamp = showDate.getTime();
    // Shows von heute ausschließen und nur zukünftige Shows bis zum nächsten Monat anzeigen
    return showDateTimestamp > today.getTime() && showDate <= nextMonth;
  });

  useEffect(() => {
    fetchShows({ setIsLoading, setShows, setError });
  }, []);

  const ShowCard = ({ showtime }: { showtime: Show }) => (
    <Card key={showtime.id} className="flex flex-col h-[600px]">
      <CardHeader className="space-y-2">
        {showtime.image_url && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={showtime.image_url}
              alt={showtime.title}
              width={500}
              height={750}
              layout="responsive"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardTitle className="line-clamp-2 h-[3rem]">{showtime.title}</CardTitle>
        <CardDescription>Saal: {showtime.name}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm">
          <span className="font-semibold">Beschreibung:</span>{' '}
          <span className="line-clamp-4">{showtime.description}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold">Startzeit:</span> {
            new Date(showtime.start_time).toLocaleString('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            })
          }
        </p>
      </CardContent>
      <CardFooter className="mt-auto">
        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md">
          Tickets buchen
        </button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      {isLoading && <p>Lade Vorstellungen...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Heute im Programm</h2>
        {todayShows.length === 0 ? (
          <p className="text-gray-500">Heute keine Vorstellungen</p>
        ) : (
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {todayShows.map((show) => (
                <div key={show.id} className="flex-none w-80">
                  <ShowCard showtime={show} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Demnächst im Programm</h2>
        {futureShows.length === 0 ? (
          <p className="text-gray-500">Keine weiteren Vorstellungen geplant</p>
        ) : (
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {futureShows.map((show) => (
                <div key={show.id} className="flex-none w-80">
                  <ShowCard showtime={show} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}