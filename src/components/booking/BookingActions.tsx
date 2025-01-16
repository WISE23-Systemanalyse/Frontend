'use client';

import { useRouter } from 'next/navigation';

interface BookingActionsProps {
  booking: {
    id: number;
    // weitere Eigenschaften...
  };
}

const BookingActions = ({ booking }: BookingActionsProps) => {
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      // Hier könnte die Bestätigung an das Backend gesendet werden
      router.push(`/payment?bookingId=${booking.id}`);
    } catch (error) {
      console.error('Fehler bei der Bestätigung:', error);
    }
  };

  const handleCancel = () => {
    router.push('/'); // Zurück zur Startseite
  };

  return (
    <div className="flex justify-end space-x-4 pt-6">
      <button
        onClick={handleCancel}
        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
      >
        Abbrechen
      </button>
      <button
        onClick={handleConfirm}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
      >
        Zur Zahlung
      </button>
    </div>
  );
};

export default BookingActions;