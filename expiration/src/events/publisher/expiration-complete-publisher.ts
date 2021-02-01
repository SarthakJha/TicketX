import {
  ExpirationCompleteEvent,
  Subjects,
  Publisher,
} from '@ticketingsarthak/common';
export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
