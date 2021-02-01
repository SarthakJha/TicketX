import request from 'supertest';
import mongoose from 'mongoose';
import { app } from './../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@ticketingsarthak/common';
import { Order } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';

it('changes the order status to Cancelled', async () => {
  const user = await global.signIn();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  const { body: initialOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${initialOrder.id}`)
    .set('Cookie', user)
    .expect(204);

  // console.log(deletedOrder); // {}

  const updatedOrder = await Order.findById(initialOrder.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order cancelled event', async () => {
  const user = await global.signIn();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 120,
  });
  await ticket.save();

  const { body: initialOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${initialOrder.id}`)
    .set('Cookie', user)
    .expect(204);

  const updatedOrder = await Order.findById(initialOrder.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

  // expect natsWrapper to call publish func when order deleted
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
