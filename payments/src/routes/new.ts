import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  BadRequestError,
  validateRequest,
  NotAuthorizedError,
  OrderStatus,
} from '@ticketingsarthak/common';
import { Order } from './../models/order';
import { body } from 'express-validator';
import { stripe } from './../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from './../events/publishers/payment-created-publisher';
import { natsWrapper } from './../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('cant buy a cancelled order');
    }

    // bills user for specified amount
    const charge = await stripe.charges.create({
      currency: 'inr',
      amount: order.price * 100, // *100 bcos stripe amount works in smallest currency unit i.e paisa/cents
      source: token,
    });
    if (!charge) {
      throw new Error('something went wrong creating charge');
    }

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      id: payment.id,
    });

    return res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
