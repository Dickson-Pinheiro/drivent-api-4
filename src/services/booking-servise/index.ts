import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomRepository from '@/repositories/room-repository';
import ticketsRepository from '@/repositories/tickets-repository';

export async function getBooking(id: number) {
  try {
    const booking = await bookingRepository.getBookingWithUserId(id);
    if (!booking) {
      throw notFoundError();
    }
    return booking;
  } catch (error) {
    throw error;
  }
}

async function createBooking(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const room = await roomRepository.getRoomById(roomId);

  if (!room || !enrollment || !ticket) throw notFoundError();

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === 'RESERVED') {
    throw { name: 'forbbiden' };
  }

  if (room.capacity > room.Booking.length + 1) throw { name: 'forbbiden' };

  const booking = bookingRepository.createBooking(userId, roomId);
  return booking;
}

const bookingService = {
  getBooking,
  createBooking,
};

export default bookingService;
