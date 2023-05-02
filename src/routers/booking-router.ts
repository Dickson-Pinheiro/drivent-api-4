import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, createBooking, updateBooking } from '@/controllers';
import { bookingSchema } from '@/schemas/bookingSchema';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), createBooking)
  .put('/:bookingId', updateBooking);
export { bookingRouter };
