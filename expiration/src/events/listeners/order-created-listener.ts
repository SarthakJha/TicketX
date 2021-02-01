import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@ticketingsarthak/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from './../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(msg: Message, data: OrderCreatedEvent['data']) {
    // new Date(data.expiresAt).getTime() - new Date().getTime() return delay in milliseconds
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(delay);
    await expirationQueue.add(
      {
        orderId: data.id,
      }
      // {
      //   delay: delay,
      // }
    );

    msg.ack();
  }
}
