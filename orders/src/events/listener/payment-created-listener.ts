import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@ticketingsarthak/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = QueueGroupName;
  async onMessage(msg: Message, data: PaymentCreatedEvent['data']) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();
    msg.ack();
  }
}
