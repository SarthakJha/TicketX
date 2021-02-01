import {
  Subjects,
  Publisher,
  TicketUpdatedEvent,
} from '@ticketingsarthak/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
