import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);  // Debug-Log

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/halls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);  // Debug-Log
      throw new Error(errorData.message || 'Backend request failed');
    }

    const data = await response.json();
    console.log('Backend response:', data);  // Debug-Log
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in halls API route:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Saals' },
      { status: 500 }
    );
  }
} 