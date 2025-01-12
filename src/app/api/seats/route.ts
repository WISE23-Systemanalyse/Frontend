import { NextResponse } from 'next/server';

interface Seat {
  row: number;
  col: number;
  type: string | null;
}

interface RequestBody {
  hall_id: number;
  seats: Seat[];
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    console.log('Received from frontend:', body);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Erstelle jeden Sitz einzeln
    const results = await Promise.all(
      body.seats
        .filter((seat: Seat) => seat.type !== null)
        .map(async (seat: Seat) => {
          const seatData = {
            hall_id: Number(body.hall_id),
            row_number: Number(seat.row),
            seat_number: Number(seat.col),
            seat_type: seat.type
          };

          console.log('Sending seat:', seatData);

          const response = await fetch(`${backendUrl}/seats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(seatData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Fehler beim Erstellen eines Sitzes');
          }

          return response.json();
        })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in seats API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Sitze' },
      { status: 500 }
    );
  }
}