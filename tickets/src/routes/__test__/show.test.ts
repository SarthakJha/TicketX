import { Request } from 'supertest';
import { app } from './../../app';
import request from 'supertest';
import mongoose from 'mongoose';

it('returns 404 if ticket is not found', async () => {
  /**
   * WARNING:
   * entering a random id in req.params.id will give out a status(500)
   * check error-handler.ts (common)
   * debugging this error is pretty nasty
   * so we put a console.error(err) in there(error-handler.ts)
   */
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).expect(404);
});

it('returns the ticket if found', async () => {
  const cookie = await global.signIn();
  const testTicket = {
    title: 'lakers',
    price: 23,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testTicket);
  expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .expect(200);

  expect(ticketResponse.body.title).toEqual(testTicket.title);
  expect(ticketResponse.body.price).toEqual(testTicket.price);
});
