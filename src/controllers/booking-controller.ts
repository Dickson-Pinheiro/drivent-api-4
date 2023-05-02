import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-servise';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const booking = await bookingService.getBooking(userId);
    return res.send(booking);
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        res.status(404).send();
        break;
      default:
        break;
    }
  }
}
export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    const booking = await bookingService.createBooking(roomId, userId);
    return res.send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(404);
    }
    if (error.name === 'forbbiden') {
      return res.sendStatus(403);
    }
  }
}
