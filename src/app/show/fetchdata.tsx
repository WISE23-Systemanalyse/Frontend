import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { showId: string } }
) {
  try {
    const response = await fetch(`${process.env.API_URL}/shows/${params.showId}/seats`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 })
  }
}