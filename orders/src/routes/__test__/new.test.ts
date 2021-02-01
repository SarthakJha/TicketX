import mongoose from 'mongoose';
import request from 'supertest';
import { app } from './../../app';
import { Ticket } from './../../models/ticket';
import { Order } from './../../models/orders';

// natsWrapper created in the __mocks__ gets executed rather than actual natsWrapper
import { natsWrapper } from './../../nats-wrapper';
import { OrderStatus } from '@ticketingsarthak/common';

it('returns error if ticket doesnt exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.signIn())
    .send({ ticketId })
    .expect(404);
});

it('returns error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'dasdsa',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket: ticket,
    userId: '4454522',
    expiresAt: new Date(),
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.signIn())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'dasdsa',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);
});

// for tests we need to comeback and write once we implement the feature (like a to-do list)
it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'dasdsa',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);

  // expect the publish function to have been called
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
