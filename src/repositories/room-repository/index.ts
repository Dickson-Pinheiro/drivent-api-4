import { prisma } from '@/config';

async function getRoomById(id: number) {
  return prisma.room.findUnique({
    where: {
      id,
    },
    include: {
      Booking: true,
    },
  });
}

const roomRepository = {
  getRoomById,
};

export default roomRepository;
