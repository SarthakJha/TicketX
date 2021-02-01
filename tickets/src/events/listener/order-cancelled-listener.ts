import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  OrderCancelledEvent,
} from '@ticketingsarthak/common';
import { Ticket } from './../../models/tickets';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedPublisher } from './../publisher/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(msg: Message, data: OrderCreatedEvent['data']) {
    // find ticket for the order
    const ticket = await Ticket.findById(data.ticket.id);

    // if !ticket , throw Error
    if (!ticket) {
      throw new Error('ticket not found');
    }
    // change OrderId to undefined
    ticket.set({ orderId: undefined });

    // save ticket
    await ticket.save(); // ++ the verion of order

    // VERSION IS CHANGED. SO PUBLISH AN EVENT (TO MAINTAIN DATA CONSISTENCY)
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      userId: ticket.userID,
      title: ticket.title,
      price: ticket.price,
      orderId: ticket.orderId!,
    });

    // ack message
    msg.ack();
  }
}
