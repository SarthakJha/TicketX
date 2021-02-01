import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@ticketingsarthak/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
