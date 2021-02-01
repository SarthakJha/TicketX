import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@ticketingsarthak/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
