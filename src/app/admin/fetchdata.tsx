interface User {
    id: number
    name: string
    email: string
}

interface Props {
    userId: number
    setIsLoading: (isLoading: boolean) => void
    setUser: (user: User | null) => void
    setError: (error: string | null) => void
}


export const fetchUser = async ({userId, setUser, setError, setIsLoading }: Props) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/user/${userId}`)
      console.log("Response: ", response)
      if (!response.ok) {
        throw new Error('User nicht gefunden')
      }
      const data = await response.json();
      setUser(data)
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }
