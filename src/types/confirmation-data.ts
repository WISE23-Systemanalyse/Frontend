import { Payment } from "./payment";
import { BookingDetails } from "./booking-details";

export interface ConfirmationData {
  payment: Payment;
  bookings: BookingDetails[];
} 