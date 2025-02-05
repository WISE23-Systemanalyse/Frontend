'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Toast } from "@/components/ui/toast";
import { SeatEditor } from "@/components/admin/SeatEditor";

interface Seat {
  id: number;
  hall_id: number;
  row_number: number;
  seat_number: number;
  category_id: number;
  seat_status?: string;
}

interface NewSeat {
  hall_id: number;
  row_number: number;
  seat_number: number;
  category_id: number;
}

const API_BASE_URL = process.env.BACKEND_URL;

// Initialisiere 5 Reihen mit je 10 Sitzen mit der Standard-Kategorie (ID 1)
const INITIAL_SEATS = Array.from({ length: 50 }, (_, index) => ({
  id: -(index + 1),
  hall_id: 0,
  row_number: Math.floor(index / 10) + 1,
  seat_number: (index % 10) + 1,
  category_id: 1  // Stellen Sie sicher, dass diese ID in der Datenbank existiert
}));

export default function CreateHall() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  });
  const [categories, setCategories] = useState<any[]>([]);

  // Füge useEffect hinzu, um Kategorien zu laden und zu loggen
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        console.log('Verfügbare Kategorien:', data);
        setCategories(data);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) return;

    try {
      setIsLoading(true);
      setToast({
        message: 'Saal wird erstellt...',
        variant: 'loading',
        isVisible: true
      });

      // 1. Saal erstellen
      const hallResponse = await fetch(`${API_BASE_URL}/halls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          seating_capacity: selectedSeats.length
        })
      });

      if (!hallResponse.ok) {
        throw new Error('Saal konnte nicht erstellt werden');
      }

      const hall = await hallResponse.json();

      // 2. Sitze erstellen
      if (selectedSeats.length > 0) {
        // Konvertiere die Sitze in das richtige Format
        const newSeats: NewSeat[] = selectedSeats.map(seat => ({
          hall_id: hall.id,
          row_number: seat.row_number,
          seat_number: seat.seat_number,
          category_id: seat.category_id
        }));

        const syncResponse = await fetch(`${API_BASE_URL}/seats/halls/${hall.id}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSeats)
        });

        if (!syncResponse.ok) {
          const errorText = await syncResponse.text();
          console.error('Sync Response Error:', errorText);
          throw new Error('Sitze konnten nicht erstellt werden');
        }
      }

      setToast({
        message: 'Saal wurde erfolgreich erstellt!',
        variant: 'success',
        isVisible: true
      });

      setTimeout(() => {
        router.push('/admin/halls');
      }, 500);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'error',
        isVisible: true
      });
      console.error('Fehler beim Erstellen:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-red-500 transition-colors"
              onClick={() => router.push('/admin/halls')}
            >
              <ChevronLeft className="h-5 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Neuen Saal erstellen</h1>
          </div>
        </div>

        <Card className="bg-[#2C2C2C] border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="text-white">Neuer Saal</CardTitle>
                <p className="text-gray-400">Kapazität: {selectedSeats.length} Sitzplätze</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading || !name.trim()} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
                <Button 
                  onClick={() => router.push('/admin/halls')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Input
                placeholder="Saalname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 placeholder:text-gray-400"
              />
              
              <SeatEditor
                seats={selectedSeats}
                onChangeAction={(newSeats) => setSelectedSeats(newSeats)}
                hallId={0}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
