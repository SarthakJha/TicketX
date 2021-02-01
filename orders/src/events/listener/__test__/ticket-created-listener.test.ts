import { Message } from 'node-nats-streaming';
import { TicketCreatedListener } from './../ticket-created-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { TicketCreatedEvent } from '@ticketingsarthak/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 12,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create fake message object
  // @ts-ignore // so that we dont have to implement all the fake properties of Message object
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('create and saves a ticket from event', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data + message

  await listener.onMessage(msg, data);

  // assesrtion to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket!).toBeDefined();
  // expect(ticket!.title).toEqual(data.title);
});
