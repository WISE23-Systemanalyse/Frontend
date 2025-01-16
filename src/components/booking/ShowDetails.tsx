'use client';

import { useEffect, useState } from 'react';

interface Show {
  id: number;
  movie_id: number;
  hall_id: number;
  date: string;
  time: string;
}

interface Movie {
  id: number;
  title: string;
}

interface Hall {
    id: number;
    name: string;
}

interface ShowDetailsProps {
  showId: number;
}

const ShowDetails = ({ showId }: ShowDetailsProps) => {
  const [show, setShow] = useState<Show | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [hall, setHall] = useState<Hall | null>(null);


  useEffect(() => {
    const fetchShowAndMovie = async () => {
      try {
        const showResponse = await fetch(`http://localhost:8000/shows/${showId}`);
        const showData = await showResponse.json();
        setShow(showData);

        const movieResponse = await fetch(`http://localhost:8000/movies/${showData.movie_id}`);
        const movieData = await movieResponse.json();
        setMovie(movieData);

        const hallResponse = await fetch(`http://localhost:8000/halls/${showData.hall_id}`);
        const hallData = await hallResponse.json();
        setHall(hallData);
      } catch (error) {
        console.error('Fehler beim Laden der Details:', error);
      }
    };

    fetchShowAndMovie();
  }, [showId]);

  if (!show || !movie) return <div>Laden der Vorstellungsdetails...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{"Film:" + movie.title}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600">Datum</p>
          <p>{show.date ? show.date.split(' ')[0].split('-').reverse().join('.') : 'Kein Datum'}</p>
        </div>
        <div>
          <p className="text-gray-600">Uhrzeit</p>
          <p>{"13:00 Uhr"}</p>
        </div>
        <div>
          <p className="text-gray-600">Saal</p>
          <p>{hall?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;