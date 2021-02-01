import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from '@ticketingsarthak/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupName } from './queue-group-name';
import { Order } from './../../models/orders';
import { OrderCancelledPublisher } from './../publisher/order-cancelled-publisher';
import { natsWrapper } from './../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = QueueGroupName;
  async onMessage(msg: Message, data: ExpirationCompleteEvent['data']) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order completed event');
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    msg.ack();
  }
}
