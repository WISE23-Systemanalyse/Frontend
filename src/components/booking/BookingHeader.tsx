interface BookingHeaderProps {
    bookingId: number;
  }
  
  const BookingHeader = ({ bookingId }: BookingHeaderProps) => {
    return (
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Buchungsübersicht</h1>
        <p className="text-gray-600">Buchungsnummer: #{bookingId}</p>
      </div>
    );
  };
  
  export default BookingHeader;