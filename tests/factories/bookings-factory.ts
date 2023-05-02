import faker from '@faker-js/faker';
import { User } from '@prisma/client';
import { createHotel } from './hotels-factory';
import { prisma } from '@/config';

export async function createRoom() {
  const hotel = await createHotel();

  return prisma.room.create({
    data: {
      capacity: 2,
      name: faker.name.firstName(),
      hotelId: hotel.id,
    },
  });
}

export async function createBooking(user: Partial<User>) {
  const room = await createRoom();
  return prisma.booking.create({
    data: {
      roomId: room.id,
      userId: user.id,
    },
  });
}
