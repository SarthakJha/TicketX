import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ticketingsarthak/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
