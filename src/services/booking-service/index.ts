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
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const room = await roomRepository.getRoomById(roomId);

  if (!ticket) throw notFoundError();

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === 'RESERVED') {
    throw { name: 'forbbiden' };
  }
  if (!room) {
    throw notFoundError();
  }
  if (room.capacity < room.Booking.length + 1) throw { name: 'forbbiden' };

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking;
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  try {
    const booking = await bookingRepository.getBookingById(bookingId);
    const userBooking = await bookingRepository.getBookingWithUserId(userId);

    if (!booking) {
      throw notFoundError();
    }
    if (booking.userId !== userId || !userBooking) {
      throw { name: 'forbbiden' };
    }
    const room = await roomRepository.getRoomById(roomId);
    if (!room) {
      throw notFoundError();
    }

    const bookingsWithRoomId = await bookingRepository.getBookingWithRoomId(roomId);

    if (room.capacity < bookingsWithRoomId.length + 1) throw { name: 'forbbiden' };

    const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId);
    return updatedBooking;
  } catch (error) {
    throw error;
  }
}

const bookingService = {
  getBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
