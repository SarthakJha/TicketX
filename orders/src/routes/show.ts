import express, { Response, Request } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@ticketingsarthak/common';
import { Order } from '../models/orders';

const router = express.Router();

// can also add custom mongoID check too
router.get(
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
    res.status(200).send(order);
  }
);
export { router as showOrderRouter };
