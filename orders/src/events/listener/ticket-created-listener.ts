import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from '@ticketingsarthak/common';
import { QueueGroupName } from './queue-group-name';
import { Ticket } from './../../models/ticket';

// LISTENERS INITIALIZED IN index.ts

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  // using queuegroupname declared from ./queue-group-name.ts (avoid hardcoding names)
  queueGroupName = QueueGroupName;
  async onMessage(msg: Message, data: TicketCreatedEvent['data']) {
    const { id, title, price } = data;

    /**
     * COMMON TICKET IDs SHOULD MAINTAINED ACROSS BOTH THE SERVICES
     */
    const ticket = Ticket.build({
      // to maintain common ids across services while replicating data
      id: id,
      title: title,
      price: price,
    });
    await ticket.save();

    // ack message after replicating the data to db
    msg.ack();
  }
}
