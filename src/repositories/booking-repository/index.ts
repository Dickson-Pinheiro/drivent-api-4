import { prisma } from '@/config/database';

async function getBookingWithUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function getBookingWithRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

async function getBookingById(id: number) {
  return prisma.booking.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      Room: true,
      userId: true,
    },
  });
}

const bookingRepository = {
  getBookingWithUserId,
  createBooking,
  getBookingWithRoomId,
  updateBooking,
  getBookingById,
};

export default bookingRepository;
