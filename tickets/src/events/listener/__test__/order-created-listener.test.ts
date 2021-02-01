import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from './../order-created-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus } from '@ticketingsarthak/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/tickets';

const setup = async () => {
  // create instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'conc',
    price: 100,
    userID: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  // create fake data
  const data: OrderCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'asasa',
    status: OrderStatus.Created,
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

  return { listener, data, msg, ticket };
};

it('sets userId on orderCreated event', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(msg, data);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(msg, data);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(msg, data);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // accessing calls made by MOCK natWrapper
  const ticketUpdatedEvent = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedEvent.orderId);
});
