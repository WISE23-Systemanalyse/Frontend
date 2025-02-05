"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Movie, Show, Seat } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from 'lucide-react';
import MovieInfo from "@/components/movie-booking/movie-info";
import { HallLayout } from "@/components/hall/HallLayout";

interface ShowGroups {
  [key: string]: Show[];
}

interface MovieBookingLayoutProps {
  movie: Movie;
  show?: Show;
  showGroups?: ShowGroups;
  onShowSelect: (show: Show) => void;
  onSeatSelect: (seats: Seat[]) => void;
  onCheckout: () => void;
  selectedShowId?: number;
  selectedSeats: Seat[];
  showTimes?: boolean;
  onBack?: () => void;
}

export function MovieBookingLayout({
  movie,
  show,
  showGroups = {},
  onShowSelect,
  onSeatSelect,
  onCheckout,
  selectedShowId,
  selectedSeats,
  showTimes = false,
  onBack
}: MovieBookingLayoutProps) {
  const router = useRouter();
  const [showHallLayout, setShowHallLayout] = useState(!showTimes);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="min-h-screen bg-[#141414] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#2C2C2C] hover:bg-red-600/20 
                     flex items-center justify-center transition-all duration-200 group"
            aria-label="Zurück"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {movie.title}
          </h1>
        </div>

        <Card className="bg-[#2C2C2C] border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <MovieInfo {...movie} />
              </div>

              <div className="lg:col-span-2 space-y-8">
                {showTimes && !showHallLayout ? (
                  // Vorstellungsauswahl
                  <div className="bg-[#1C1C1C] rounded-xl p-6 shadow-md space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Vorstellung wählen
                    </h2>
                    {Object.entries(showGroups)
                      .sort(([dateA], [dateB]) => {
                        if (dateA === 'Heute') return -1;
                        if (dateB === 'Heute') return 1;
                        if (dateA === 'Morgen') return -1;
                        if (dateB === 'Morgen') return 1;
                        return 0;
                      })
                      .map(([date, dayShows]) => (
                        <div key={date}>
                          <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">{date}</h2>
                            <div className="text-gray-400 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              {dayShows.length} {dayShows.length === 1 ? 'Vorstellung' : 'Vorstellungen'}
                            </div>
                          </div>
                          
                          <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-4 pb-4 scroll-smooth">
                              {dayShows.map((show) => (
                                <button
                                  key={show.show_id}
                                  onClick={() => {
                                    onShowSelect(show);
                                    setShowHallLayout(true);
                                  }}
                                  className="group flex flex-col items-center p-4 rounded-lg transition-all 
                                           bg-neutral-800/50 hover:bg-neutral-700/50 
                                           min-w-[120px] border border-red-500/10
                                           hover:border-red-500/30 relative overflow-hidden
                                           hover:z-10 cursor-pointer"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-80" />
                                  
                                  <div className="relative z-10 transform group-hover:scale-105 transition-transform">
                                    <div className="text-lg font-semibold mb-1 text-white group-hover:text-red-400 transition-colors">
                                      {formatTime(show.start_time)}
                                    </div>
                                    <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                                      Saal {show.hall_name}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  // Saalansicht
                  <div className="space-y-8">
                    <div className="bg-[#1C1C1C] rounded-xl p-6 shadow-md">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                          Sitzplatz wählen
                        </h2>
                        {(showTimes || onBack) && (
                          <button
                            onClick={() => showTimes ? setShowHallLayout(false) : onBack?.()}
                            className="flex items-center gap-2 text-gray-400 hover:text-white group"
                          >
                            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                            <span>Zurück zur Vorstellungsauswahl</span>
                          </button>
                        )}
                      </div>

                      <div className="text-gray-400 mb-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {show && `${formatDateTime(show.start_time).date} um ${formatDateTime(show.start_time).time} Uhr • Saal ${show.hall_name}`}
                      </div>
                      <HallLayout
                        showID={selectedShowId!}
                        onSeatSelectAction={onSeatSelect}
                      />
                    </div>

                    <div className="flex justify-center pt-4">
                      <button
                        onClick={onCheckout}
                        disabled={selectedSeats.length === 0}
                        className={`
                          px-8 py-3 rounded-lg text-lg font-medium
                          transition-all duration-200 transform
                          ${selectedSeats.length === 0 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}
                        `}
                      >
                        {selectedSeats.length > 0 
                          ? `${selectedSeats.length} ${selectedSeats.length === 1 ? 'Platz' : 'Plätze'} buchen` 
                          : 'Bitte Plätze auswählen'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 