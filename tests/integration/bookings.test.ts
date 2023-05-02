import supertest from 'supertest';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createUser,
  createBooking,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithoutHotel,
  createTicketTypeWithHotel,
  createReservedBooking,
  createRoom,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

afterAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there is a valid token, but no exists booking', async () => {
      const token = await generateValidToken();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 when there is a valid token and booking exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await createBooking(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          Room: expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        }),
      );
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking').send({
      bookingId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
      roomId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
      roomId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there is a valid token, but no exists enrollment.', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there is a valid token, but no exists ticket.', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when there is a valid token, but ticket is remote.', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when there is a valid token, but ticket no includes hotel.', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when there is a valid token, but ticket no PAID.', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'RESERVED');
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when there is a valid token and roomId not exists.', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when there is a valid token and room is reserved', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const roomId = await createReservedBooking();
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId,
      });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when there is a valid token and room is reserved', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const room = await createRoom();
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});

describe('PUT booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post(`/booking/${1}`).send({
      roomId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put(`/booking/${1}`).set('Authorization', `Bearer ${token}`).send({
      roomId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/booking/${1}`).set('Authorization', `Bearer ${token}`).send({
      roomId: 1,
    });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user not contain booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

      const response = await server.put(`/booking/${1}`).set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when roomId is not exists.', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const booking = await createBooking(user);
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: 1,
      });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it('should respond with status 403 when roomId is reserved.', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const booking = await createBooking(user);
      const roomId = await createReservedBooking();
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 when roomId is available.', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const booking = await createBooking(user);
      const room = await createRoom();
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.OK);
    });
  });
});
