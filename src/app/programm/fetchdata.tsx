import { Dispatch, SetStateAction } from "react"

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

interface Props {
    setIsLoading: (isLoading: boolean) => void
    setShows: Dispatch<SetStateAction<Show[]>>
    setError: (error: string | null) => void
}


export const fetchShows = async ({setIsLoading, setShows, setError}: Props) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/shows/details`)
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        throw new Error('Shows konnten nicht geladen werden');
      }

      const data: Show[] = await response.json();
      console.log('Response Body:', data);
      setShows(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
}