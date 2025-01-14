import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Filme | Kino',
  description: 'Entdecke alle Filme in unserem Kino',
}

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 