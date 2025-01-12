import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { hallId: string } }
) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/seats/halls/${params.hallId}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Sitze' }, { status: 500 });
  }
}