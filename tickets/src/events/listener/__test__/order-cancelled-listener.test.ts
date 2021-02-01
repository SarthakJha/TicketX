import { Message } from 'node-nats-streaming';
import { natsWrapper } from './../../../nats-wrapper';
import {
  OrderCreatedEvent,
  OrderStatus,
  OrderCancelledEvent,
} from '@ticketingsarthak/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/tickets';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // create instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'conc',
    price: 100,
    userID: mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId: orderId });
  await ticket.save();

  // create fake data
  const data: OrderCancelledEvent['data'] = {
    version: 0,
    id: orderId,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: '1234',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create fake message object
  // @ts-ignore // so that we dont have to implement all the fake properties of Message object
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, orderId };
};

it('updates, publishes and acks the event', async () => {
  const { listener, data, msg, ticket, orderId } = await setup();
  await listener.onMessage(msg, data);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(msg.ack).toHaveBeenCalled();
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
