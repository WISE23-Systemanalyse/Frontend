import { Dispatch, SetStateAction } from "react"

interface Show {
        id: number;
        movie_id: number;
        hall_id: number;
        start_time: string;
        title: string;
        description: string;
        image_url: string;
        hall_name: string;
        duration: number;
}

interface Props {
    setIsLoading?: (isLoading: boolean) => void;
    setShows?: Dispatch<SetStateAction<Show[]>>;
    setError?: (error: string | null) => void;
}

export const fetchShows = async (props: Props): Promise<Show[]> => {
    if (props.setIsLoading) props.setIsLoading(true);
    if (props.setError) props.setError(null);

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/shows/details`);
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers));

      console.log('Response Body:', response.body);
      
      if (!response.ok) {
        throw new Error('Shows konnten nicht geladen werden');
      }

      const data: Show[] = await response.json();
      console.log('Response Body:', data);
      
      if (props.setShows) props.setShows(data);
      return data;

    } catch (err) {
      console.error(err);
      if (props.setError) {
        props.setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      }
      throw err;
    } finally {
      if (props.setIsLoading) props.setIsLoading(false);
    }
};