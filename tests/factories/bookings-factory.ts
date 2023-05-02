import faker from '@faker-js/faker';
import { User } from '@prisma/client';
import { createHotel } from './hotels-factory';
import { createUser } from './users-factory';
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

export async function createReservedBooking() {
  const room = await createRoom();
  const user1 = await createUser();
  const user2 = await createUser();
  await prisma.booking.create({
    data: {
      roomId: room.id,
      userId: user1.id,
    },
  });
  await prisma.booking.create({
    data: {
      roomId: room.id,
      userId: user2.id,
    },
  });
  return room.id;
}
