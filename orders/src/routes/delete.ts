import express, { Response, Request } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@ticketingsarthak/common';

import { OrderCancelledPublisher } from './../events/publisher/order-cancelled-publisher';
import { natsWrapper } from './../nats-wrapper';
import { Order } from '../models/orders';

const router = express.Router();

// deleting here doesnt necessarily mean to delete the record
// just changing the order status to Cancelled
// .patch would have been better
router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish order cancelled event
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
