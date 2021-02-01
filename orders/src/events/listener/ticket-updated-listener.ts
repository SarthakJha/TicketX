import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
} from '@ticketingsarthak/common';
import { QueueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

// LISTENERS INITIALIZED IN index.ts

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

  // using queuegroupname declared from ./queue-group-name.ts (avoid hardcoding names)
  queueGroupName = QueueGroupName;
  async onMessage(msg: Message, data: TicketUpdatedEvent['data']) {
    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new Error('ticket not found to update');
    }

    const { title, price } = data;
    // updating the ticket
    ticket.set({ title, price });
    await ticket.save();

    // ack the event recieved
    msg.ack();
  }
}
