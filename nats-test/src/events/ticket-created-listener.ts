import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  queueGroupName = 'payment-service';
  // readonly cant be updated. same as final in java
  //subject: Subjects.TicketCreated = Subjects.TicketCreated;
  readonly subject = Subjects.TicketCreated;

  onMessage(msg: Message, data: TicketCreatedEvent['data']) {
    console.log(data.id);
    // msg.ack();
  }
}
