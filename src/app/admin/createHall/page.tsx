'use client';
import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SeatData = {
  row: number;
  col: number;
  type: 'Standard' | 'VIP' | null;
};

const seatTypes = [
  { id: 'Standard', name: 'Standard Sitz', color: 'blue' },
  { id: 'VIP', name: 'VIP Sitz', color: 'yellow' },
] as const;

export default function CreateHall() {
  const [hallName, setHallName] = useState('');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [seats, setSeats] = useState<SeatData[]>(
    Array.from({ length: 5 * 8 }, (_, idx) => ({
      row: Math.floor(idx / 8) + 1,
      col: (idx % 8) + 1,
      type: null
    }))
  );
  const [selectedType, setSelectedType] = useState(seatTypes[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const initializeSeats = (r: number, c: number) => {
    setSeats(
      Array.from({ length: r * c }, (_, idx) => ({
        row: Math.floor(idx / c) + 1,
        col: (idx % c) + 1,
        type: null
      }))
    );
  };

  const handleSeatClick = (row: number, col: number, isDragging = false) => {
    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.row === row && seat.col === col
          ? { ...seat, type: isDragging || seat.type === selectedType.id ? null : selectedType.id }
          : seat
      )
    );
  };

  const handleSubmit = async () => {
    if (!hallName.trim()) {
      setMessage({ text: 'Bitte geben Sie einen Saalnamen ein', isError: true });
      return;
    }

    const activeSeats = seats.filter(seat => seat.type !== null);
    if (activeSeats.length === 0) {
      setMessage({ text: 'Bitte wählen Sie mindestens einen Sitzplatz aus', isError: true });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Erstelle zuerst den Saal
      const hallResponse = await fetch('/api/halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hallName,
          seating_capacity: activeSeats.length,
        }),
      });

      if (!hallResponse.ok) throw new Error('Fehler beim Erstellen des Saals');
      
      const hallData = await hallResponse.json();
      const hallId = hallData.id;

      // Erstelle dann die Sitze mit korrekter Struktur
      const seatsResponse = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hall_id: hallId,
          seats: activeSeats.map(seat => ({
            row: seat.row,
            col: seat.col,
            type: seat.type
          }))
        }),
      });

      if (!seatsResponse.ok) throw new Error('Fehler beim Erstellen der Sitze');

      setMessage({ text: 'Saal erfolgreich erstellt!', isError: false });
      setHallName('');
      initializeSeats(rows, cols);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Neuen Kinosaal erstellen</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Saalname</label>
            <input
              type="text"
              value={hallName}
              onChange={(e) => setHallName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Saalname eingeben"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reihen</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(20, Number(e.target.value)));
                  setRows(value);
                  initializeSeats(value, cols);
                }}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Spalten</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(20, Number(e.target.value)));
                  setCols(value);
                  initializeSeats(rows, value);
                }}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                max="20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sitzplatztyp</label>
            <Listbox value={selectedType} onChange={setSelectedType}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border">
                  <span className="block truncate">{selectedType.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                  {seatTypes.map((type) => (
                    <Listbox.Option
                      key={type.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
                      }
                      value={type}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {type.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          <div 
            className="grid gap-1 mt-6"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {seats.map((seat, idx) => (
              <button
                key={idx}
                onMouseDown={() => handleSeatClick(seat.row, seat.col)}
                onMouseEnter={() => isDragging && handleSeatClick(seat.row, seat.col, true)}
                className={cn(
                  'aspect-square p-1 text-xs border-2 rounded transition-colors',
                  seat.type === 'Standard' && 'bg-blue-100 border-blue-500',
                  seat.type === 'VIP' && 'bg-yellow-100 border-yellow-500',
                  !seat.type && 'bg-white border-gray-300'
                )}
              >
                {`${seat.row}-${seat.col}`}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'w-full py-2 px-4 rounded-md text-white font-medium',
              isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Wird erstellt...
              </span>
            ) : (
              'Saal erstellen'
            )}
          </button>

          {message && (
            <div className={cn(
              'p-4 rounded-md',
              message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            )}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
