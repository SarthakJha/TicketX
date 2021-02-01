import {
  Subjects,
  Publisher,
  TicketCreatedEvent,
} from '@ticketingsarthak/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
