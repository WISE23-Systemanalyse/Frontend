import { use } from 'react'
import EditShowingClient from './EditShowingClient'

export default function EditShowingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <EditShowingClient params={resolvedParams} />
} 