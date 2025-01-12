import { Dispatch, SetStateAction } from "react"

interface Show {
    id: number
    movie_id: number
    hall_id: number
    start_time: string
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
      const response = await fetch(`${process.env.BACKEND_URL}/shows`)
    //   console.log("Response: ", response)
      if (!response.ok) {
        throw new Error('Shows konnten nicht geladen werden')
      }
      const data: Show[] = await response.json();
      setShows(data)
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }