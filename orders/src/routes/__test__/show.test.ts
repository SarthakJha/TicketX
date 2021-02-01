import request from 'supertest';
import { app } from './../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/orders';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  const user = await global.signIn();
  // create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  // make req to build order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200);

  expect(order.userId).toEqual(fetchedOrder.userId);
});

it('sends 404 if order not found', async () => {
  const user = await global.signIn();
  // create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const mongooseId = mongoose.Types.ObjectId();

  await request(app)
    .get(`/api/orders/${mongooseId}`)
    .set('Cookie', user)
    .expect(404);
});

it('return not authorized error when accessed by anybody else', async () => {
  const user1 = await global.signIn();
  const user2 = await global.signIn();

  // create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user2)
    .expect(401);
});
