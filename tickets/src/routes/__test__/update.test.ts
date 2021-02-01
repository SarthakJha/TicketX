import request from 'supertest';
import mongoose from 'mongoose';

import { app } from './../../app';
import { natsWrapper } from './../../nats-wrapper';
import { Ticket } from './../../models/tickets';

it('returns 404 if id does not exist', async () => {
  /**
   * WARNING:
   * entering a random id in req.params.id will give out a status(500)
   * check error-handler.ts (common)
   * debugging this error is pretty nasty
   * so we put a console.error(err) in there(error-handler.ts) (in common package)
   */
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', await global.signIn())
    .expect(400);
});

it('returns 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).expect(401);
});

it('returns 401 if user is unauthorized', async () => {
  const cookie = await global.signIn();
  const testticket = {
    title: 'wqer',
    price: 1234,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testticket)
    .expect(201);

  const userID = response.body.userID;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', await global.signIn()) //await global.signIn() will generate a user with new id(different than cookie)
    .send({
      title: 'wqer',
      price: 100,
    })
    .expect(401);
});

it('returns 400 if bad body is provided', async () => {
  const cookie = await global.signIn();
  const testticket = {
    title: 'wqer',
    price: 1234,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testticket)
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 12,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'update',
    })
    .expect(400);
});

it('updates the ticket for valid user', async () => {
  const cookie = await global.signIn();
  const testticket = {
    title: 'wqer',
    price: 1234,
  };
  const updatedTicket = {
    title: 'title changed',
    price: 10,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testticket)
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updatedTicket)
    .expect(200);

  const getResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .expect(200);

  expect(getResponse.body.title).toEqual(updatedTicket.title);
  expect(getResponse.body.price).toEqual(updatedTicket.price);
});

it('publishes an event on new ticket update', async () => {
  const cookie = await global.signIn();
  let ticket = await Ticket.find({});
  expect(ticket.length).toEqual(0);

  const testTicket = {
    title: 'test',
    price: 1234,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testTicket);
  expect(201);

  // console.log(natsWrapper);
  /**
   * {
        client: {
          publish: [Function: mockConstructor] {
            _isMockFunction: true,
            getMockImplementation: [Function],
            mock: [Getter/Setter],
            mockClear: [Function],
            mockReset: [Function],
            mockRestore: [Function],
            mockReturnValueOnce: [Function],
            mockResolvedValueOnce: [Function],
            mockRejectedValueOnce: [Function],
            mockReturnValue: [Function],
            mockResolvedValue: [Function],
            mockRejectedValue: [Function],
            mockImplementationOnce: [Function],
            mockImplementation: [Function],
            mockReturnThis: [Function],
            mockName: [Function],
            getMockName: [Function]
          }
        }
      }
   */
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if ticket is already reserved', async () => {
  const cookie = await global.signIn();
  const testticket = {
    title: 'wqer',
    price: 1234,
  };
  const updatedTicket = {
    title: 'title changed',
    price: 10,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testticket)
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updatedTicket)
    .expect(400);
});
