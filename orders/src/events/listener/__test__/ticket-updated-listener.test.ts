import { Message } from 'node-nats-streaming';
import { TicketCreatedListener } from './../ticket-created-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { TicketUpdatedEvent } from '@ticketingsarthak/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // create instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'sffdasas',
    price: 1233,
  });
  await ticket.save();

  // create fake data
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'concert',
    price: 1000,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create fake message object
  // @ts-ignore // so that we dont have to implement all the fake properties of Message object
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds,updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(msg, data);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(msg, data);
  expect(msg.ack).toHaveBeenCalled();
});

it('doesnt call ack if event is skipped', async () => {
  const { listener, data, msg, ticket } = await setup();
  data.version = 10;

  const { title, price } = data;
  try {
    await listener.onMessage(msg, data);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
